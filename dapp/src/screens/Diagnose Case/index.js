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
import { withContractRegistry, withSaga, cacheCallValue } from '@/saga-genesis'
import bytesToHex from '@/utils/bytes-to-hex'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'

function mapStateToProps(state, { match, contractRegistry }) {
  const caseAddress = match.params.caseAddress
  let account = get(state, 'accounts[0]')
  let accountManager = contractRegistry.requireAddressByName('AccountManager')

  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const patientPublicKey = cacheCallValue(state, accountManager, 'publicKeys', patientAddress)
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'approvedDoctorKeys', account)
  if (patientPublicKey && encryptedCaseKey) {
    const sharedKey = deriveSharedKey(signedInSecretKey(), patientPublicKey.substring(2))
    var caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)
  }
  return {
    account,
    showDiagnosis: !!account,
    caseKey,
    status: cacheCallValue(state, caseAddress, 'status'),
    doctorA: cacheCallValue(state, caseAddress, 'diagnosingDoctorA'),
    diagnosisHash: getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash')),
    doctorB: cacheCallValue(state, caseAddress, 'diagnosingDoctorB'),
    challengeHash: getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisBLocationHash'))
  }
}

function* saga(ownProps, { cacheCall, contractRegistry }) {
  const caseAddress = ownProps.match.params.caseAddress

  if (!contractRegistry.hasAddress(caseAddress)) {
    contractRegistry.add(yield getCaseContract(caseAddress))
  }
  let accountManager = contractRegistry.addressByName('AccountManager')

  const patientAddress = yield cacheCall(caseAddress, 'patient')
  const patientPublicKey = yield cacheCall(accountManager, 'publicKeys', patientAddress)
  const encryptedCaseKey = yield cacheCall(caseAddress, 'approvedDoctorKeys', ownProps.account)

  let status = parseInt(yield cacheCall(caseAddress, 'status'))

  if (status >= 3) { yield cacheCall(caseAddress, 'diagnosingDoctorA') }
  if (status >= 5) { yield cacheCall(caseAddress, 'diagnosisALocationHash') }
  if (status >= 9) { yield cacheCall(caseAddress, 'diagnosingDoctorB') }
  if (status >= 10) { yield cacheCall(caseAddress, 'diagnosisBLocationHash') }
}

const DiagnoseCase = withContractRegistry(connect(mapStateToProps)(withSaga(saga)(class extends Component {
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
})))

export default DiagnoseCase;
