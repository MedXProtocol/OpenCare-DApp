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
import get from 'lodash.get'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import * as routes from '~/config/routes'

function mapStateToProps(state, { accounts }) {
  const cases = []
  const account = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', account)

  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', account, caseIndex)
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
    account,
    caseCount,
    cases,
    CaseManager,
    AccountManager
  }
}

function mapDispatchToProps (dispatch) {
  return {
    invalidate: (address) => dispatch({type: 'CACHE_INVALIDATE_ADDRESS', address})
  }
}

function* saga({ account, CaseManager, AccountManager }) {
  if (!account || !CaseManager) { return }
  let caseCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', account)
  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = yield cacheCall(CaseManager, 'patientCases', account, caseIndex)
    yield all([
      addContract({ address: caseAddress, contractKey: 'Case' }),
      cacheCall(caseAddress, 'status')
    ])
  }
}

export const PatientCases = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['account', 'CaseManager', 'AccountManager', 'caseCount']})(class _PatientCases extends Component {
  componentDidMount () {
    this.props.invalidate(this.props.CaseManager)
  }

  render() {
    return (
      <div className="card">
        <div className="card-body table-responsive">
          {
            !this.props.cases.length ?
            <div className="blank-state">
              <div className="blank-state--inner text-center text-gray">
                <span>You do not have any historical or pending cases.</span>
              </div>
            </div> :
            <div>
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
          }
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
