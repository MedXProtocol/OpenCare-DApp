import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseDetails from '../../components/CaseDetails';
import SubmitDiagnosis from './components/SubmitDiagnosis';
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
import { withPropSagaContext } from '@/saga-genesis/with-prop-saga-context'
import bytesToHex from '@/utils/bytes-to-hex'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'

function mapStateToProps(state, ownProps) {
  return {
    account: get(state, 'accounts[0]')
  }
}

function* propSaga(ownProps, { cacheCall, contractRegistry }) {
  if (!ownProps.account) {
    return {
      showDiagnosis: false
    }
  }

  const props = {}

  props.caseAddress = ownProps.match.params.caseAddress

  if (!contractRegistry.hasAddress(props.caseAddress)) {
    contractRegistry.add(yield getCaseContract(props.caseAddress))
  }
  if (!contractRegistry.hasName('AccountManager')) {
    contractRegistry.add(yield getAccountManagerContract(), 'AccountManager')
  }
  let accountManager = contractRegistry.addressByName('AccountManager')

  const patientAddress = yield cacheCall(props.caseAddress, 'patient')

  const patientPublicKey = yield cacheCall(accountManager, 'publicKeys', patientAddress)
  const sharedKey = deriveSharedKey(signedInSecretKey(), patientPublicKey.substring(2))
  const encryptedCaseKey = yield cacheCall(props.caseAddress, 'approvedDoctorKeys', ownProps.account)
  props.caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)

  props.status = yield cacheCall(props.caseAddress, 'status')

  if (props.status.code >= 3) {
    props.doctorA = yield cacheCall(props.caseAddress, 'diagnosingDoctorA')
  }
  if (props.status.code >= 5) {
    props.diagnosisHash = getFileHashFromBytes(yield cacheCall(props.caseAddress, 'diagnosisALocationHash'))
  }
  if (props.status.code >= 9) {
    props.doctorB = yield cacheCall(props.caseAddress, 'diagnosingDoctorB')
  }
  if (props.status.code >= 10) {
    props.challengeHash = getFileHashFromBytes(yield cacheCall(props.caseAddress, 'diagnosisBLocationHash'))
  }

  return props
}

const DiagnoseCase = drizzleConnect(withPropSagaContext(propSaga, class extends Component {
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
