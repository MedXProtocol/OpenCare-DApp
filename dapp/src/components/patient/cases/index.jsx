import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { all } from 'redux-saga/effects'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { CaseRow } from '~/components/CaseRow'
import { contractByName } from '~/saga-genesis/state-finders'
import { addContract } from '~/saga-genesis/sagas'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTop } from '~/components/ScrollToTop'
import { patientCaseStatusToName, patientCaseStatusToClass } from '~/utils/patientCaseStatusLabels'
import { defined } from '~/utils/defined'
import rangeRight from 'lodash.rangeright'
import get from 'lodash.get'
import forOwn from 'lodash.forown'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let index = 0
  const cases = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)

  for (let objIndex = (caseCount - 1); objIndex >= 0; --objIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, objIndex)
    if (caseAddress) {
      let status = cacheCallValue(state, caseAddress, 'status')
      cases.push({
        caseAddress,
        status,
        objIndex
      })
    }
  }

  forOwn(state.sagaGenesis.transactions, function(transaction, transactionId) {
    const { confirmed, error, call } = transaction
    const isNewPatientCase = (call && call.method === 'approveAndCall')
    const isAccepting = (call && call.method === 'acceptDiagnosis')
    const isSecondOpinion = (call && call.method === 'challengeWithDoctor')

    // A tx we care about
    if (call && (!confirmed || defined(error))) {
      // Add new case to cases array
      if (isNewPatientCase) {
        transaction = {
          ...transaction,
          transactionId,
          objIndex: parseInt(caseCount, 10) + index
        }
        cases.splice(0, 0, transaction)
        index++
      }
    }

    // Update a pre-existing case in the cases array
    if ((isAccepting || isSecondOpinion) && (!confirmed || defined(error))) {
      const caseIndex = cases.findIndex(c => c.caseAddress === transaction.address)
      if (caseIndex >= 0) {
        cases[caseIndex] = {
          ...cases[caseIndex],
          ...transaction,
          status: -1, // 'pending' tx state, before it's confirmed on the blockchain
          transactionId
        }
      }
    }

  })

  return {
    address,
    caseCount,
    cases,
    CaseManager
  }
}

function* saga({ address, CaseManager }) {
  if (!address || !CaseManager) { return }
  const caseCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', address)
  const indices = rangeRight(caseCount)
  yield all(indices.map(function* (objIndex) {
    const caseAddress = yield cacheCall(CaseManager, 'patientCases', address, objIndex)
    yield all([
      addContract({ address: caseAddress, contractKey: 'Case' }),
      cacheCall(caseAddress, 'status')
    ])
  }))
}

export const PatientCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'CaseManager', 'caseCount']})(class _PatientCases extends Component {
  render() {
    let loadingLines, noCases, cases
    const loading = (this.props.caseCount === undefined)

    if (loading) {
      loadingLines = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span><LoadingLines visible={true} /></span>
          </div>
        </div>
      )
    } else if (!this.props.cases.length) {
      noCases = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span>You do not have any historical or pending cases.</span>
          </div>
        </div>
      )
    } else {
      cases = (
        <div>
          <h5 className="title subtitle">
            Current Cases:
          </h5>
          <FlipMove
            enterAnimation="accordionVertical"
            leaveAnimation="accordionVertical"
            className="case-list"
          >
            {this.props.cases.map(caseRowObject => {
              caseRowObject['statusLabel'] = patientCaseStatusToName(caseRowObject.status)
              caseRowObject['statusClass'] = patientCaseStatusToClass(caseRowObject.status)
              return (
                <CaseRow
                  route={routes.PATIENTS_CASE}
                  caseRowObject={caseRowObject}
                  key={caseRowObject.objIndex}
                />
              )
            })}
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
          {cases}
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
