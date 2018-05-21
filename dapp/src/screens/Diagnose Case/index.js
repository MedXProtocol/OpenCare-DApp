import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseDetails from '../../components/CaseDetails';
import SubmitDiagnosis from './components/SubmitDiagnosis';
import Diagnosis from '@/components/Diagnosis';
import { withPropSaga } from '@/components/with-prop-saga'
import { signedInSecretKey } from '@/services/sign-in'
import { deriveSharedKey } from '@/services/derive-shared-key'
import aes from '@/services/aes'
import isBlank from '@/utils/is-blank'
import get from 'lodash.get'
import {
  getCaseStatus,
  getCaseContract,
  getAccountManagerContract,
  getCaseDoctorADiagnosisLocationHash
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
  if (!ownProps.account) {
    return {
      showDiagnosis: false
    }
  }

  const caseAddress = ownProps.match.params.caseAddress

  // need our private key and the patient's public key
  const caseContract = yield getCaseContract(caseAddress)
  const patientAddress = yield caseContract.methods.patient().call()
  const accountManagerContract = yield getAccountManagerContract()
  const patientPublicKey = yield accountManagerContract.methods.publicKeys(patientAddress).call()
  const sharedKey = deriveSharedKey(signedInSecretKey(), patientPublicKey.substring(2))
  const encryptedCaseKey = yield caseContract.methods.approvedDoctorKeys(ownProps.account).call()
  const caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)

  const status = yield getCaseStatus(caseAddress)
  const doctorA = yield caseContract.methods.diagnosingDoctorA().call()

  const diagnosisHash = yield getCaseDoctorADiagnosisLocationHash(caseAddress)

  if (ownProps.account === doctorA) {
    var isDiagnosingDoctor = true
  }

  return {
    caseAddress,
    caseKey,
    diagnosisHash,
    isDiagnosingDoctor
  }
}

const DiagnoseCase = drizzleConnect(withPropSaga(propSaga, class extends Component {
  render () {
    if (!isBlank(this.props.diagnosisHash)) {
      var diagnosis =
        <div className="col">
          <Diagnosis caseAddress={this.props.caseAddress} caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.isDiagnosingDoctor) {
      diagnosis =
        <div className="col">
          <SubmitDiagnosis caseAddress={this.props.caseAddress} caseKey={this.props.caseKey} />
        </div>
    }

    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            {diagnosis}
            <div className="col">
              <CaseDetails caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}), mapStateToProps)

export default DiagnoseCase;
