import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import CaseDetails from '~/components/CaseDetails'
import { SubmitDiagnosisContainer } from './SubmitDiagnosis'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import Diagnosis from '~/components/Diagnosis'
import { getAccount } from '~/services/sign-in'
import aes from '~/services/aes'
import { isBlank } from '~/utils/isBlank'
import get from 'lodash.get'
import { withContractRegistry, withSaga, cacheCallValue } from '~/saga-genesis'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state, { match }) {
  const caseAddress = match.params.caseAddress
  let account = get(state, 'sagaGenesis.accounts[0]')
  const AccountManager = contractByName(state, 'AccountManager')
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const patientPublicKey = cacheCallValue(state, AccountManager, 'publicKeys', patientAddress)
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'doctorEncryptedCaseKeys', account)
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisHash'))
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'challengeHash'))
  if (patientPublicKey && encryptedCaseKey) {
    const sharedKey = getAccount().deriveSharedKey(patientPublicKey.substring(2))
    var caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)
  }
  return {
    account,
    caseAddress,
    showDiagnosis: !!account,
    caseKey,
    diagnosingDoctor,
    diagnosisHash,
    challengingDoctor,
    challengeHash,
    AccountManager
  }
}

function* saga({ match, account, AccountManager }) {
  if (!AccountManager) { return }
  const caseAddress = match.params.caseAddress
  yield addContract({ address: caseAddress, contractKey: 'Case'})
  const patientAddress = yield cacheCall(caseAddress, 'patient')
  yield cacheCall(AccountManager, 'publicKeys', patientAddress)
  yield cacheCall(caseAddress, 'doctorEncryptedCaseKeys', account)
  yield cacheCall(caseAddress, 'diagnosingDoctor')
  yield cacheCall(caseAddress, 'diagnosisHash')
  yield cacheCall(caseAddress, 'challengingDoctor')
  yield cacheCall(caseAddress, 'challengeHash')
}

export const DiagnoseCaseContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match', 'account', 'AccountManager']})(class _DiagnoseCase extends Component {
  render () {
    var challenging = this.props.challengingDoctor === this.props.account

    if (!isBlank(this.props.challengeHash)) {
      var challenge =
        <div className='col-xs-12'>
          <ChallengedDiagnosis
            caseAddress={this.props.match.params.caseAddress}
            caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.challengingDoctor === this.props.account && !this.props.challengeHash) {
      challenge =
        <div className='col-xs-12'>
          <SubmitDiagnosisContainer
            caseAddress={this.props.caseAddress}
            caseKey={this.props.caseKey}
            diagnosisHash={this.props.diagnosisHash} />
        </div>
    }

    if (!isBlank(this.props.diagnosisHash) && !challenging) {
      var diagnosis =
        <div className='col-xs-12'>
          <Diagnosis
            caseAddress={this.props.caseAddress}
            caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.diagnosingDoctor === this.props.account && !this.props.diagnosisHash) {
      diagnosis =
        <div className='col-xs-12'>
          <SubmitDiagnosisContainer
            caseAddress={this.props.caseAddress}
            caseKey={this.props.caseKey} />
        </div>
    }

    return (
      <MainLayoutContainer>
        <div className='container'>
          <div className='row'>
            {diagnosis}
            {challenge}
            <div id="view-case-details" className='col-xs-12'>
              <CaseDetails
                caseAddress={this.props.match.params.caseAddress}
                caseKey={this.props.caseKey} />
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    )
  }
})))
