import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import CaseStatus from './CaseStatus'
import CaseDetails from '~/components/CaseDetails'
import Diagnosis from '~/components/Diagnosis'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import { decryptCaseKey } from '~/services/decrypt-case-key'
import { currentAccount } from '~/services/sign-in'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'
import { PageTitle } from '~/components/PageTitle'

function mapStateToProps(state, { match }) {
  const caseAddress = match.params.caseAddress
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisHash'))

  return {
    diagnosisHash,
    encryptedCaseKey,
    caseKeySalt
  }
}

function* saga({ match }) {
  const caseAddress = match.params.caseAddress
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'encryptedCaseKey'),
    cacheCall(caseAddress, 'caseKeySalt'),
    cacheCall(caseAddress, 'diagnosisHash')
  ])
}

export const PatientCaseContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match']})(class _PatientCase extends Component {
  render() {
    const caseKey = decryptCaseKey(currentAccount(), this.props.encryptedCaseKey, this.props.caseKeySalt)

    if (this.props.diagnosisHash) {
      var diagnosis =
        <div className='col-xs-12'>
          <Diagnosis
            caseAddress={this.props.match.params.caseAddress}
            caseKey={caseKey} />
        </div>
    }
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.patientCase', { caseId: ('' + this.props.match.params.caseAddress).substring(0, 6)})} />
        <div className="container">
          <div className="row">
            {caseKey ? (
              <div className='col-xs-12'>
                <CaseStatus caseAddress={this.props.match.params.caseAddress}/>
              </div>
            ) : null}

            {diagnosis}
            <div className='col-xs-12'>
              <ChallengedDiagnosis
                caseAddress={this.props.match.params.caseAddress}
                caseKey={caseKey}
                title='Second Diagnosis'
              />
            </div>
            <div className='col-xs-12'>
              <CaseDetails
                caseAddress={this.props.match.params.caseAddress}
                caseKey={caseKey}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
})))
