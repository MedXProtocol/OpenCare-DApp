import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseDetails from '../../components/CaseDetails';
import SubmitDiagnosis from './components/SubmitDiagnosis';
import { withPropSaga } from '@/saga-genesis/with-prop-saga'
import ChallengedDiagnosis from '@/components/ChallengedDiagnosis';
import Diagnosis from '@/components/Diagnosis';
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

  const props = {}

  props.caseAddress = ownProps.match.params.caseAddress

  // need our private key and the patient's public key
  const caseContract = yield getCaseContract(props.caseAddress)
  const patientAddress = yield caseContract.methods.patient().call()
  const accountManagerContract = yield getAccountManagerContract()
  const patientPublicKey = yield accountManagerContract.methods.publicKeys(patientAddress).call()
  const sharedKey = deriveSharedKey(signedInSecretKey(), patientPublicKey.substring(2))
  const encryptedCaseKey = yield caseContract.methods.approvedDoctorKeys(ownProps.account).call()
  props.caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)

  props.status = yield getCaseStatus(props.caseAddress)

  if (props.status.code >= 3) {
    props.doctorA = yield caseContract.methods.diagnosingDoctorA().call()
  }
  if (props.status.code >= 5) {
    props.diagnosisHash = yield getCaseDoctorADiagnosisLocationHash(props.caseAddress)
  }
  if (props.status.code >= 9) {
    props.doctorB = yield caseContract.methods.diagnosingDoctorB().call()
  }
  if (props.status.code >= 10) {
    props.challengeHash = yield caseContract.methods.diagnosingDoctorB().call()
  }

  return props
}

const DiagnoseCase = drizzleConnect(withPropSaga(propSaga, class extends Component {
  render () {
    if (!this.props.status) { return <div></div> }

    if (!isBlank(this.props.challengeHash)) {
      var challenge =
        <div className='col'>
          <ChallengedDiagnosis caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.doctorB === this.props.account) {
      challenge =
        <div className='col'>
          <SubmitDiagnosis caseAddress={this.props.caseAddress} caseKey={this.props.caseKey} diagnosisHash={this.props.diagnosisHash} />
        </div>
    }

    if (!isBlank(this.props.diagnosisHash)) {
      var diagnosis =
        <div className='col'>
          <Diagnosis caseAddress={this.props.caseAddress} caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.doctorA === this.props.account) {
      diagnosis =
        <div className='col'>
          <SubmitDiagnosis caseAddress={this.props.caseAddress} caseKey={this.props.caseKey} />
        </div>
    }

    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            {diagnosis}
            {challenge}
            <div className='col'>
              <CaseDetails caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}), mapStateToProps)

export default DiagnoseCase;
