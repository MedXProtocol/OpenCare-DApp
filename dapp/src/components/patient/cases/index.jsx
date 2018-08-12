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
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import rangeRight from 'lodash.rangeright'
import get from 'lodash.get'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let cases = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  let caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)
  if (caseCount) {
    caseCount = parseInt(caseCount, 10)
  }
  const transactions = state.sagaGenesis.transactions

  for (let objIndex = caseCount; objIndex > 0; --objIndex) {
    const caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, objIndex - 1)
    if (caseAddress) {
      const status = cacheCallValue(state, caseAddress, 'status')
      const createdAt = cacheCallValue(state, caseAddress, 'createdAt')
      cases.push({
        caseAddress,
        status,
        createdAt,
        objIndex: objIndex
      })
    }
  }

  cases = addOrUpdatePendingTxs(transactions, cases, caseCount)

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
  yield all(indices.map(function* (index) {
    const caseAddress = yield cacheCall(CaseManager, 'patientCases', address, index)
    // console.log('called by patients cases index saga')
    yield all([
      addContract({ address: caseAddress, contractKey: 'Case' }),
      cacheCall(caseAddress, 'createdAt'),
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
                  key={caseRowObject.objIndex}
                  route={routes.PATIENTS_CASE}
                  caseRowObject={caseRowObject}
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
