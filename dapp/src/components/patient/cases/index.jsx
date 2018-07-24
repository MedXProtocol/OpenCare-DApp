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
import get from 'lodash.get'
import { ScrollToTopOnMount } from '~/components/ScrollToTopOnMount'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import * as routes from '~/config/routes'
import rangeRight from 'lodash.rangeright'

function mapStateToProps(state) {
  const cases = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)

  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, caseIndex)
    if (caseAddress) {
      let status = cacheCallValue(state, caseAddress, 'status')
      cases.push({
        caseAddress,
        status,
        caseIndex
      })
    }
  }

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
  yield all(indices.map(function* (caseIndex) {
    const caseAddress = yield cacheCall(CaseManager, 'patientCases', address, caseIndex)
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
          <FlipMove enterAnimation="accordionVertical" className="case-list">
            {this.props.cases.map(({caseAddress, status, caseIndex}) => {
              const statusLabel = caseStatusToName(status)
              const statusClass = caseStatusToClass(status)
              return (
                <CaseRow
                  route={routes.PATIENTS_CASE}
                  statusLabel={statusLabel}
                  statusClass={statusClass}
                  caseAddress={caseAddress}
                  caseIndex={caseIndex}
                  key={caseIndex} />
              )
            })}
          </FlipMove>
        </div>
      )
    }

    return (
      <div className="card">
        <ScrollToTopOnMount />
        <div className="card-body table-responsive">
          {loadingLines}
          {noCases}
          {cases}
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
