import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import {
  getAllCasesForCurrentAccount,
  getCaseManagerContract
} from '@/utils/web3-util'
import './PatientCases.css'
import { withSaga, withContractRegistry, cacheCallValue } from '@/saga-genesis'
import { PatientCaseRow } from './patient-case-row'
import { connect } from 'react-redux'
import get from 'lodash.get'

function mapStateToProps(state, { contractRegistry, accounts }) {
  let account = get(state, 'accounts[0]')
  let caseManager = contractRegistry.requireAddressByName('CaseManager')
  return {
    account,
    caseListCount: cacheCallValue(state, caseManager, 'getPatientCaseListCount', account)
  }
}

function* saga(ownProps, { cacheCall, contractRegistry }) {
  let caseManager = contractRegistry.addressByName('CaseManager')
  yield cacheCall(caseManager, 'getPatientCaseListCount', ownProps.account)
}

const PatientCases = connect(mapStateToProps)(withSaga(saga, class _PatientCases extends Component {
  render() {
    return (
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">Case Log</h4>
            </div>
            <div className="card-content table-responsive">
            {
                !this.props.caseListCount ?
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
                      {[...Array(parseInt(this.props.caseListCount)).keys()].map((i) => <PatientCaseRow address={this.props.account} caseIndex={i} key={i} />)}
                    </tbody>
                </table>
            }
            </div>
        </div>
    )
  }
}))

export default withRouter(PatientCases)
