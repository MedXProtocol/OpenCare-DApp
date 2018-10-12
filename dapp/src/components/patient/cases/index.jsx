import React, { Component } from "react";
import classnames from "classnames";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import FlipMove from "react-flip-move";
import { all } from "redux-saga/effects";
import { formatRoute } from "react-router-named-routes";
import {
  cacheCall,
  contractByName,
  withSaga,
  cacheCallValue,
  cacheCallValueInt
} from "saga-genesis";
import { CaseRow } from "~/components/CaseRow";
import { LoadingLines } from "~/components/LoadingLines";
import { ScrollToTop } from "~/components/ScrollToTop";
import { transactionFinders } from "~/finders/transactionFinders";
import { addPendingTx } from "~/services/pendingTxs";
import { defined } from "~/utils/defined";
import { Pagination } from "~/components/Pagination";
import range from "lodash.range";
import get from "lodash.get";
import * as routes from "~/config/routes";
import { fixAddress } from "~/utils/fixAddress";

const MAX_CASES_PER_PAGE = 5;

function mapStateToProps(state, props) {
  let caseAddresses = [];
  const address = get(state, "sagaGenesis.accounts[0]");
  const CaseManager = contractByName(state, "CaseManager");
  const createAndAssignCaseTxs = transactionFinders.createAndAssignCase(state);

  const caseCount = cacheCallValueInt(
    state,
    CaseManager,
    "getPatientCaseListCount",
    address
  );
  const currentPage = parseInt(props.match.params.currentPage, 10);

  const start =
    caseCount - (parseInt(currentPage, 10) - 1) * MAX_CASES_PER_PAGE;
  const end = Math.max(start - MAX_CASES_PER_PAGE, 0);

  caseAddresses = range(end, start).reduce((accumulator, index) => {
    const caseAddress = fixAddress(
      cacheCallValue(state, CaseManager, "patientCases", address, index)
    );
    if (caseAddress) {
      accumulator.push(caseAddress);
    }
    return accumulator;
  }, []);

  return {
    address,
    caseCount,
    caseAddresses,
    CaseManager,
    currentPage,
    createAndAssignCaseTxs
  };
}

function* saga({ address, CaseManager }) {
  if (!address || !CaseManager) {
    return;
  }
  const caseCount = yield cacheCall(
    CaseManager,
    "getPatientCaseListCount",
    address
  );

  const indices = range(caseCount);
  yield all(
    indices.map(function*(index) {
      yield cacheCall(CaseManager, "patientCases", address, index);
    })
  );
}

export const PatientCases = connect(mapStateToProps)(
  withSaga(saga)(
    class _PatientCases extends Component {
      renderCaseRows(caseAddresses, transactions, caseCount) {
        let caseRows = caseAddresses.map((caseAddress, index) => {
          return (
            <CaseRow
              caseAddress={caseAddress}
              key={`open-case-row-${index}`}
              path={formatRoute(routes.PATIENTS_CASE, {
                caseAddress,
                currentPage: this.props.currentPage
              })}
              context="patient"
            />
          );
        });

        let objIndex = caseCount + 1;
        transactions.forEach(transaction => {
          if (!defined(transaction.call)) {
            return;
          } // continue

          const caseRowObject = addPendingTx(transaction, objIndex);

          if (caseRowObject) {
            caseRows.push(
              <CaseRow
                caseRowObject={caseRowObject}
                objIndex={objIndex}
                key={`new-case-row-${objIndex}`}
                context="patient"
              />
            );

            objIndex++;
          }
        });

        return caseRows.reverse();
      }

      render() {
        let loadingLines, noCases, caseRows;
        const { caseAddresses, caseCount, createAndAssignCaseTxs } = this.props;
        const loading = this.props.caseCount === undefined;

        const totalPages = Math.ceil(this.props.caseCount / MAX_CASES_PER_PAGE);

        if (loading) {
          loadingLines = (
            <div className="blank-state">
              <div className="blank-state--inner text-center text-gray">
                <span>
                  <LoadingLines visible={true} />
                </span>
              </div>
            </div>
          );
        } else if (
          !caseAddresses.length &&
          createAndAssignCaseTxs.length === 0
        ) {
          noCases = (
            <div className="blank-state">
              <div className="blank-state--inner text-center text-gray">
                <span>You do not have any historical or pending cases.</span>
              </div>
            </div>
          );
        } else {
          caseRows = (
            <div>
              <h5 className="title subtitle">Current Cases:</h5>
              <FlipMove
                enterAnimation="accordionVertical"
                leaveAnimation="accordionVertical"
                className="case-list"
              >
                {this.renderCaseRows(
                  caseAddresses,
                  createAndAssignCaseTxs,
                  caseCount
                )}
              </FlipMove>
            </div>
          );
        }

        return (
          <div className="card">
            <ScrollToTop />
            <div
              className={classnames("card-body", {
                "card-body--cases__has-pagination": totalPages > 1
              })}
            >
              {loadingLines}
              {noCases}
              {caseRows}
            </div>

            <Pagination
              currentPage={this.props.currentPage}
              totalPages={totalPages}
              formatPageRoute={number =>
                formatRoute(routes.PATIENTS_CASES_PAGE_NUMBER, {
                  currentPage: number
                })
              }
            />
          </div>
        );
      }
    }
  )
);

export const PatientCasesContainer = withRouter(PatientCases);
