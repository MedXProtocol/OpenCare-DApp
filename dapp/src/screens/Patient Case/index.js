import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseStatus from './components/CaseStatus';
import CaseDetails from '../../components/CaseDetails';
import Diagnosis from '@/components/Diagnosis';
import ChallengedDiagnosis from '@/components/ChallengedDiagnosis';
import { getCaseKey, getCaseDoctorADiagnosisLocationHash, getCaseContract } from '@/utils/web3-util'
import { signedInSecretKey } from '@/services/sign-in'
import aes from '@/services/aes'
import { withPropSagaContext } from '@/saga-genesis/with-prop-saga-context'
import bytesToHex from '@/utils/bytes-to-hex'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'

function* propSaga(ownProps, { cacheCall, contractRegistry }) {
  const caseAddress = ownProps.match.params.caseAddress

  if (!contractRegistry.hasAddress(caseAddress)) {
    contractRegistry.add(yield getCaseContract(caseAddress))
  }

  const encryptedCaseKey = bytesToHex(yield cacheCall(caseAddress, 'getEncryptedCaseKey'))
  const caseKey = aes.decrypt(encryptedCaseKey, signedInSecretKey())

  const diagnosisHash = getFileHashFromBytes(yield cacheCall(caseAddress, 'diagnosisALocationHash'))
  return {
    caseKey,
    diagnosisHash
  }
}

const PatientCase = withPropSagaContext(propSaga, class extends Component {
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
              <ChallengedDiagnosis caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
            <div className="col">
              <CaseDetails caseAddress={this.props.match.params.caseAddress} caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
})

export default PatientCase;
