import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseStatus from './components/CaseStatus';
import CaseDetails from '../../components/CaseDetails';
import Diagnosis from '@/components/Diagnosis';
import ChallengedDiagnosis from '@/components/ChallengedDiagnosis';
import { getCaseKey, getCaseDoctorADiagnosisLocationHash } from '@/utils/web3-util'
import { signedInSecretKey } from '@/services/sign-in'
import aes from '@/services/aes'
import { withPropSaga } from '@/components/with-prop-saga'

function* propSaga(ownProps) {
  const caseAddress = ownProps.match.params.caseAddress
  const encryptedCaseKey = yield getCaseKey(caseAddress)
  const caseKey = aes.decrypt(encryptedCaseKey, signedInSecretKey())
  const diagnosisHash = yield getCaseDoctorADiagnosisLocationHash(caseAddress)
  return {
    caseKey,
    diagnosisHash
  }
}

const PatientCase = withPropSaga(propSaga, class extends Component {
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
