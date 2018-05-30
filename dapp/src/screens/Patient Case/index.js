import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseStatus from './components/CaseStatus';
import CaseDetails from '../../components/CaseDetails';
import Diagnosis from '@/components/Diagnosis';
import ChallengedDiagnosis from '@/components/ChallengedDiagnosis';
import { getCaseKey, getCaseDoctorADiagnosisLocationHash, getCaseContract } from '@/utils/web3-util'
import { signedInSecretKey } from '@/services/sign-in'
import aes from '@/services/aes'
import { withSaga, withContractRegistry, cacheCallValue } from '@/saga-genesis'
import { cacheCall } from '@/saga-genesis/sagas'
import bytesToHex from '@/utils/bytes-to-hex'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'

function mapStateToProps(state, { match, contractRegistry }) {
  const caseAddress = match.params.caseAddress
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  if (encryptedCaseKey) {
    var caseKey = aes.decrypt(encryptedCaseKey.substring(2), signedInSecretKey())
  }
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash'))
  return {
    caseKey,
    diagnosisHash
  }
}

function* saga({ match }, { contractRegistry }) {
  const caseAddress = match.params.caseAddress

  if (!contractRegistry.hasAddress(caseAddress)) {
    contractRegistry.add(yield getCaseContract(caseAddress))
  }

  yield cacheCall(caseAddress, 'encryptedCaseKey')
  yield cacheCall(caseAddress, 'diagnosisALocationHash')
}

const PatientCase = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match']})(class extends Component {
  render() {
    if (this.props.diagnosisHash) {
      var diagnosis =
        <div className="col">
          <Diagnosis caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
        </div>
    }
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col">
              <CaseStatus caseAddress={this.props.match.params.caseAddress}/>
            </div>
            {diagnosis}
            <div className="col">
              <ChallengedDiagnosis caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} title='Second Diagnosis' />
            </div>
            <div className="col">
              <CaseDetails caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
})))

export default PatientCase;
