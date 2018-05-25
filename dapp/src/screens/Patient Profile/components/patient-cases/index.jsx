import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import {
  getAllCasesForCurrentAccount,
  getCaseManagerContract
} from '@/utils/web3-util'
import './PatientCases.css'
import { withSaga, withContractRegistry, cacheCallValue } from '@/saga-genesis'
import { PatientCaseRow } from './patient-case-row'
import { CaseRow, caseRowSaga } from './case-row'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { fork } from 'redux-saga/effects'

function mapStateToProps(state, { contractRegistry, accounts }) {
  let account = get(state, 'accounts[0]')
  let CaseManager = contractRegistry.requireAddressByName('CaseManager')
  const caseListCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', account)
  const cases = []
  for (let caseIndex = 0; caseIndex < caseListCount; caseIndex++) {
    let c = cacheCallValue(state, CaseManager, 'patientCases', account, caseIndex)
    if (c) { cases.push(c) }
  }
  return {
    account,
    caseListCount,
    cases,
    CaseManager
  }
}

function* saga({ account }, { cacheCall, contractRegistry }) {
  let CaseManager = contractRegistry.addressByName('CaseManager')
  let patientCaseListCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', account)
  for (let i = 0; i < patientCaseListCount; i++) {
    let caseAddress = yield cacheCall(CaseManager, 'patientCases', account, i)
    yield fork(caseRowSaga, {caseAddress}, {contractRegistry})
  }
}

const PatientCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'caseListCount']})(class _PatientCases extends Component {
  render() {
    return (
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">Case Log</h4>
            </div>
            <div className="card-content table-responsive">
            {
                !this.props.caseListCount || this.props.caseListCount === '0' ?
                <div className="alert alert-info text-center">
                    <span>You do not have any historical or pending cases.</span>
                </div> :
                <table className="table">
                    <thead>
                        <tr>
                            <th className="text-center">#</th>
                            <th>Case Address</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {this.props.cases.map((caseAddress, caseIndex) => <CaseRow caseAddress={caseAddress} caseIndex={caseIndex} key={caseIndex} />
                      )}
                    </tbody>
                </table>
            }
            </div>
        </div>
    )
  }
})))

export default withRouter(PatientCases)
