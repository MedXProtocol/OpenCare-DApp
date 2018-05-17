import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import {getAllCasesForCurrentAccount} from '@/utils/web3-util'
import './PatientCases.css'
import { withCaseManager } from '@/drizzle-helpers/with-case-manager'
import { PatientCaseRow } from './patient-case-row'
import { DrizzleComponent } from '@/components/drizzle-component'

class PatientCases extends DrizzleComponent {
  drizzleInit (props) {
    // console.log(props.accounts[0])
    this.setState({
      caseListCountKey: props.CaseManager.getPatientCaseListCount.cacheCall(props.accounts[0])
    })
  }

  render() {
    var caseListCount = 0
    if (this.state.caseListCountKey) {
      caseListCount = +(this.props.CaseManager.getPatientCaseListCount.value(this.state.caseListCountKey))
    }

    return (
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">Case Log</h4>
            </div>
            <div className="card-content table-responsive">
            {
                !caseListCount ?
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
                      {[...Array(parseInt(caseListCount)).keys()].map((i) => <PatientCaseRow address={this.props.accounts[0]} caseIndex={i} key={i} />)}
                    </tbody>
                </table>
            }
            </div>
        </div>
    )
  }
}

export default withRouter(withCaseManager(PatientCases))
