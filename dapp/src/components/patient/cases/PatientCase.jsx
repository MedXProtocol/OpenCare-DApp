import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { connect } from 'react-redux'
import CaseStatus from './CaseStatus'
import Diagnosis from '~/components/Diagnosis'
import { CaseDetails } from '~/components/CaseDetails'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { decryptCaseKey } from '~/services/decrypt-case-key'
import { currentAccount } from '~/services/sign-in'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import get from 'lodash.get'

function mapStateToProps(state, { match }) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const caseAddress = match.params.caseAddress
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisHash'))
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'challengeHash'))

  return {
    challengeHash,
    diagnosisHash,
    encryptedCaseKey,
    caseKeySalt,
    networkId
  }
}

function* saga({ match, networkId }) {
  if (!networkId) { return }

  const caseAddress = match.params.caseAddress

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'encryptedCaseKey'),
    cacheCall(caseAddress, 'caseKeySalt'),
    cacheCall(caseAddress, 'diagnosisHash'),
    cacheCall(caseAddress, 'challengeHash')
  ])
}

export const PatientCaseContainer = withContractRegistry(connect(mapStateToProps)(
  withSaga(saga, { propTriggers: [ 'match', 'diagnosisHash', 'challengeHash', 'networkId' ]})(
    class _PatientCase extends Component {

  render() {
    const caseKey = decryptCaseKey(currentAccount(), this.props.encryptedCaseKey, this.props.caseKeySalt)

    if (this.props.diagnosisHash) {
      var diagnosis =
        <div className='col-xs-12'>
          <Diagnosis
            title='Initial Diagnosis'
            caseAddress={this.props.match.params.caseAddress}
            caseKey={caseKey}
          />
        </div>
    }

    if (this.props.challengeHash) {
      var challenge =
        <div className='col-xs-12'>
          <ChallengedDiagnosis
            title='Second Diagnosis'
            caseAddress={this.props.match.params.caseAddress}
            caseKey={caseKey}
          />
        </div>
    }

    return (
      <div>
        <ScrollToTop />
        <PageTitle renderTitle={(t) => t('pageTitles.patientCase', { caseId: ('' + this.props.match.params.caseAddress).substring(0, 10) + ' ...'})} />
        <div className='container'>
          <div className="row">
            {caseKey ? (
              <div className='col-xs-12'>
                <CaseStatus caseAddress={this.props.match.params.caseAddress}/>
              </div>
            ) : null}

            {diagnosis}
            {challenge}

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
