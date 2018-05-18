import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseDetails from '../../components/CaseDetails';
import SubmitDiagnosis from './components/SubmitDiagnosis';
import { withPropSaga } from '@/components/with-prop-saga'
import { signedInSecretKey } from '@/services/sign-in'
import { deriveSharedKey } from '@/services/derive-shared-key'
import aes from '@/services/aes'
import get from 'lodash.get'
import {
  getCaseContract,
  getAccountManagerContract
} from '@/utils/web3-util'
import {
  drizzleConnect
} from 'drizzle-react'

function mapStateToProps(state, ownProps) {
  return {
    account: get(state, 'accounts[0]')
  }
}

function* propSaga(ownProps) {
  if (!ownProps.account) { return }
  const caseAddress = ownProps.match.params.caseAddress
  // need our private key and the patient's public key
  const caseContract = yield getCaseContract(caseAddress)
  const patientAddress = yield caseContract.methods.patient().call()
  const accountManagerContract = yield getAccountManagerContract()
  const patientPublicKey = yield accountManagerContract.methods.publicKeys(patientAddress).call()
  const sharedKey = deriveSharedKey(signedInSecretKey(), patientPublicKey.substring(2))
  const encryptedCaseKey = yield caseContract.methods.approvedDoctorKeys(ownProps.account).call()
  const caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)

  return {
    caseKey
  }
}

const DiagnoseCase = drizzleConnect(withPropSaga(propSaga, class extends Component {

  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col">
              <CaseDetails caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
            <div className="col">
              <SubmitDiagnosis caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}), mapStateToProps)

export default DiagnoseCase;
