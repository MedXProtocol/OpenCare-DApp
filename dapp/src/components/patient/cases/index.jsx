import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { cacheCall } from '~/saga-genesis/sagas'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import {
  CaseRowContainer,
  caseRowSaga,
  mapStateToCaseRowProps
} from './CaseRow'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { fork } from 'redux-saga/effects'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state, { accounts }) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const caseListCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', account)

  const cases = []
  for (let caseIndex = caseListCount; caseIndex >= 0; --caseIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', account, caseIndex)

    if (caseAddress) {
      let caseRowProps = mapStateToCaseRowProps(state, { caseAddress })
      cases.push({
        caseAddress,
        caseRowProps,
        caseIndex
      })
    }
  }

  return {
    account,
    caseListCount,
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
  let patientCaseListCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', account)
  for (let i = 0; i < patientCaseListCount; i++) {
    let caseAddress = yield cacheCall(CaseManager, 'patientCases', account, i)
    yield fork(caseRowSaga, {caseAddress, AccountManager})
  }
}

export const PatientCases = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['account', 'CaseManager', 'AccountManager', 'caseListCount']})(class _PatientCases extends Component {
  componentDidMount () {
    this.props.invalidate(this.props.CaseManager)
  }

  render() {
    let modalHasBeenShown = false
    return (
        <div className="card">
          <div className="card-body table-responsive">
          {
            !this.props.caseListCount || this.props.caseListCount === '0' ?
            <div className="blank-state">
              <div className="blank-state--inner text-center text-gray">
                <span>You do not have any historical or pending cases.</span>
              </div>
            </div> :
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Case Address</th>
                  <th>Status</th>
                  <th className="text-right">
                    <FontAwesomeIcon icon={faEdit} />
                  </th>
                </tr>
              </thead>
              <tbody>
                <TransitionGroup component={null}>
                  {this.props.cases.map(({caseAddress, caseRowProps, caseIndex}) => {
                    let showModal = false
                    if (/3|8/.test(caseRowProps.status) && !modalHasBeenShown) {
                      modalHasBeenShown = true
                      showModal = true
                    }
                    return (
                      <CSSTransition
                        key={caseIndex}
                        timeout={100}
                        appear={true}
                        classNames="fade">
                          <CaseRowContainer
                            caseAddress={caseAddress}
                            caseIndex={caseIndex}
                            key={caseIndex}
                            {...caseRowProps}
                            showModal={showModal} />
                      </CSSTransition>
                    )
                  })}
                </TransitionGroup>
              </tbody>
            </table>
          }
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
