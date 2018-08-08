import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { CaseDetails } from '~/components/CaseDetails'
import { AbandonedCaseActions } from '~/components/doctors/cases/AbandonedCaseActions'
import { SubmitDiagnosisContainer } from './SubmitDiagnosis'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import Diagnosis from '~/components/Diagnosis'
import { ScrollToTop } from '~/components/ScrollToTop'
import { currentAccount } from '~/services/sign-in'
import { isBlank } from '~/utils/isBlank'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { decryptDoctorCaseKey } from '~/services/decryptDoctorCaseKey'
import get from 'lodash.get'
import { withContractRegistry, withSaga, cacheCallValue } from '~/saga-genesis'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'
import { contractByName } from '~/saga-genesis/state-finders'
import { PageTitle } from '~/components/PageTitle'

function mapStateToProps(state, { match }) {
  if (isEmptyObject(match.params)) { return {} }

  let address = get(state, 'sagaGenesis.accounts[0]')
  const caseAddress = match.params.caseAddress
  const AccountManager = contractByName(state, 'AccountManager')
  const caseStatus = cacheCallValue(state, caseAddress, 'status')
  const caseCreatedAt = cacheCallValue(state, caseAddress, 'createdAt')
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const patientPublicKey = cacheCallValue(state, AccountManager, 'publicKeys', patientAddress)
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'doctorEncryptedCaseKeys', address)
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisHash'))
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'challengeHash'))

  return {
    address,
    caseAddress,
    caseStatus,
    caseCreatedAt,
    showDiagnosis: !!address,
    diagnosingDoctor,
    diagnosisHash,
    challengingDoctor,
    challengeHash,
    AccountManager,
    patientPublicKey,
    encryptedCaseKey
  }
}

function* saga({ match, address, AccountManager }) {
  if (!AccountManager || isEmptyObject(match.params)) { return }
  const caseAddress = match.params.caseAddress
  // console.log('called by doctors/diagnose.js saga')
  yield addContract({ address: caseAddress, contractKey: 'Case'})
  const patientAddress = yield cacheCall(caseAddress, 'patient')
  yield all([
    cacheCall(AccountManager, 'publicKeys', patientAddress),
    cacheCall(caseAddress, 'status'),
    cacheCall(caseAddress, 'createdAt'),
    cacheCall(caseAddress, 'doctorEncryptedCaseKeys', address),
    cacheCall(caseAddress, 'diagnosingDoctor'),
    cacheCall(caseAddress, 'diagnosisHash'),
    cacheCall(caseAddress, 'challengingDoctor'),
    cacheCall(caseAddress, 'challengeHash')
  ])
}

export const DiagnoseCaseContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match', 'address', 'AccountManager']})(class _DiagnoseCase extends Component {
  render () {
    if (isEmptyObject(this.props.match.params)) { return null }

    const {
      challengingDoctor,
      address,
      diagnosisHash,
      challengeHash,
      diagnosingDoctor,
      caseAddress
    } = this.props
    const caseKey = decryptDoctorCaseKey(currentAccount(), this.props.patientPublicKey, this.props.encryptedCaseKey)

    const thisDocDiagnosingFirst = (
      !isBlank(address)
      && !isBlank(diagnosingDoctor)
      && (diagnosingDoctor === address)
      && isBlank(diagnosisHash)
    )
    const thisDocChallenging = (
      !isBlank(address)
      && !isBlank(challengingDoctor)
      && (challengingDoctor === address)
      && isBlank(challengeHash)
      && !isBlank(diagnosisHash)
    )
    const caseIsOpenForDoctor = thisDocDiagnosingFirst || thisDocChallenging

    const challengingDoc = (
      !isBlank(address)
      && !isBlank(challengingDoctor)
      && (challengingDoctor === address)
    )

    const diagnosingDoc = (
      !isBlank(address)
      && !isBlank(diagnosingDoctor)
      && (diagnosingDoctor === address)
    )

    if (!isBlank(challengeHash) && challengingDoc) {
      var challenge =
        <div className='col-xs-12'>
          <ChallengedDiagnosis
            caseAddress={this.props.match.params.caseAddress}
            caseKey={caseKey}
            title='Your Diagnosis'
            challengingDoctorAddress={challengingDoctor}
          />
        </div>
    } else if (!isBlank(diagnosisHash) && diagnosingDoc) {
      var diagnosis =
        <div className='col-xs-12'>
          <AbandonedCaseActions
            status={this.props.caseStatus}
            createdAt={this.props.caseCreatedAt}
          />
          <Diagnosis
            title='Your Diagnosis'
            caseAddress={caseAddress}
            caseKey={caseKey}
          />
        </div>
    } else if (thisDocChallenging) {
      var submitChallenge =
        <div className='col-xs-12'>
          <SubmitDiagnosisContainer
            caseAddress={caseAddress}
            caseKey={caseKey}
            diagnosisHash={diagnosisHash} />
        </div>
    } else if (thisDocDiagnosingFirst) {
      var submitDiagnosis =
        <div className='col-xs-12'>
          <SubmitDiagnosisContainer
            caseAddress={caseAddress}
            caseKey={caseKey} />
        </div>
    }

    if (caseKey === undefined) {
      diagnosis = null
      challenge = null
    } else if (caseKey === null) {
      diagnosis = (
        <div className="col-xs-12 col-md-6 col-md-offset-3">
          <div className="alert alert-warning">
            <h4>
              Cannot submit diagnosis
            </h4>
          </div>
          <hr />
        </div>
      )
      challenge = null
    }

    return (
      <div>
        <ScrollToTop />
        <PageTitle renderTitle={(t) => t('pageTitles.diagnoseCase', { caseId: ('' + caseAddress).substring(0, 10) + ' ...' } )} />
        <div className='container'>
          <div className='row'>
            {diagnosis}
            {challenge}
            <div id="view-case-details" className='col-xs-12'>
              <CaseDetails
                caseAddress={this.props.match.params.caseAddress}
                caseKey={caseKey}
                caseIsOpenForDoctor={caseIsOpenForDoctor}
                isDoctor={true} />
            </div>
            {submitDiagnosis}
            {submitChallenge}
          </div>
        </div>
      </div>
    )
  }
})))
