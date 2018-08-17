import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { all } from 'redux-saga/effects'
import { formatRoute } from 'react-router-named-routes'
import {
  cacheCall,
  contractByName,
  withSaga,
  withContractRegistry,
  cacheCallValue,
  cacheCallValueInt
} from '~/saga-genesis'
import { CaseRow } from '~/components/CaseRow'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTop } from '~/components/ScrollToTop'
import { addPendingTx } from '~/services/pendingTxs'
import { defined } from '~/utils/defined'
import { Pagination } from '~/components/Pagination'
import range from 'lodash.range'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const MAX_CASES_PER_PAGE = 5

function mapStateToProps(state, props) {
  let caseAddresses = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = Object.values(state.sagaGenesis.transactions)
  const caseCount = cacheCallValueInt(state, CaseManager, 'getPatientCaseListCount', address)
  const currentPage = parseInt(props.match.params.currentPage)

  const start = (caseCount - ((parseInt(currentPage, 10) - 1) * MAX_CASES_PER_PAGE))
  const end = Math.max((start - MAX_CASES_PER_PAGE), 0)

  caseAddresses = range(end, start).reduce((accumulator, index) => {
    const caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, index)
    if (caseAddress) {
      accumulator.push(caseAddress)
    }
    return accumulator
  }, [])

  return {
    address,
    caseCount,
    caseAddresses,
    CaseManager,
    currentPage,
    transactions
  }
}

function* saga({ address, CaseManager }) {
  if (!address || !CaseManager) { return }
  const caseCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', address)

  const indices = range(caseCount)
  yield all(indices.map(function* (index) {
    yield cacheCall(CaseManager, 'patientCases', address, index)
  }))
}

function renderCaseRows(caseAddresses, transactions, caseCount) {
  let caseRows = caseAddresses.map((caseAddress, index) => {
    return (
      <CaseRow
        caseAddress={caseAddress}
        key={`open-case-row-${index}`}
        route={routes.PATIENTS_CASE}
        context='patient'
      />
    )
  })

  let objIndex = caseCount + 1
  transactions.forEach(transaction => {
    if (!defined(transaction.call)) { return } // continue

    const caseRowObject = addPendingTx(transaction, objIndex)

    if (caseRowObject) {
      caseRows.push(
        <CaseRow
          caseRowObject={caseRowObject}
          objIndex={objIndex}
          key={`new-case-row-${objIndex}`}
          context='patient'
        />
      )

      objIndex++
    }
  })

  return caseRows.reverse()
}

export const PatientCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga)(class _PatientCases extends Component {
  render() {
    let loadingLines, noCases, caseRows
    const { caseAddresses, caseCount, transactions } = this.props
    const loading = (this.props.caseCount === undefined)

    const totalPages = Math.ceil(this.props.caseCount / MAX_CASES_PER_PAGE)

    if (loading) {
      loadingLines = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span><LoadingLines visible={true} /></span>
          </div>
        </div>
      )
    } else if (!caseAddresses.length) {
      noCases = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span>You do not have any historical or pending cases.</span>
          </div>
        </div>
      )
    } else {
      caseRows = (
        <div>
          <h5 className="title subtitle">
            Current Cases:
          </h5>
          <FlipMove
            enterAnimation="accordionVertical"
            leaveAnimation="accordionVertical"
            className="case-list"
          >
            {renderCaseRows(caseAddresses, transactions, caseCount)}
          </FlipMove>
        </div>
      )
    }

    return (
      <div className="card">
        <ScrollToTop />
        <div className="card-body">
          {loadingLines}
          {noCases}
          {caseRows}

          <Pagination
            currentPage={this.props.currentPage}
            totalPages={totalPages}
            formatPageRoute={(number) => formatRoute(routes.PATIENTS_CASES_PAGE_NUMBER, { currentPage: number })}
            />
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
