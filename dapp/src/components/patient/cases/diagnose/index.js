import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import CaseDetails from '~/components/CaseDetails'
import { SubmitDiagnosisContainer } from './SubmitDiagnosis'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import Diagnosis from '~/components/Diagnosis'
import { currentAccount } from '~/services/sign-in'
import aes from '~/services/aes'
import isBlank from '~/utils/is-blank'
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
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'approvedDoctorKeys', account)
  const status = cacheCallValue(state, caseAddress, 'status')
  const doctorA = cacheCallValue(state, caseAddress, 'diagnosingDoctorA')
  const doctorB = cacheCallValue(state, caseAddress, 'diagnosingDoctorB')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash'))
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisBLocationHash'))
  if (patientPublicKey && encryptedCaseKey) {
    const sharedKey = currentAccount().deriveSharedKey(patientPublicKey.substring(2))
    var caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)
  }
  return {
    account,
    caseAddress,
    showDiagnosis: !!account,
    caseKey,
    status,
    doctorA,
    diagnosisHash,
    doctorB,
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
  yield cacheCall(caseAddress, 'approvedDoctorKeys', account)

  let status = parseInt(yield cacheCall(caseAddress, 'status'), 10)

  if (status >= 3) { yield cacheCall(caseAddress, 'diagnosingDoctorA') }
  if (status >= 5) { yield cacheCall(caseAddress, 'diagnosisALocationHash') }
  if (status >= 9) { yield cacheCall(caseAddress, 'diagnosingDoctorB') }
  if (status >= 10) { yield cacheCall(caseAddress, 'diagnosisBLocationHash') }
}

export const DiagnoseCaseContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match', 'account', 'AccountManager']})(class _DiagnoseCase extends Component {
  render () {
    var challenging = this.props.doctorB === this.props.account
    if (this.props.status) {
      var status = parseInt(this.props.status, 10)
    } else {
      status = 0
    }

    if (!isBlank(this.props.challengeHash)) {
      var challenge =
        <div className='col-xs-12'>
          <ChallengedDiagnosis
            caseAddress={this.props.match.params.caseAddress}
            caseKey={this.props.caseKey} />
        </div>
    } else if (this.props.doctorB === this.props.account && status === 9) {
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
    } else if (this.props.doctorA === this.props.account && status === 4) {
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
