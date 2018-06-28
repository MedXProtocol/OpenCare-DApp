import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
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

function mapStateToProps(state, { match }) {
  const caseAddress = match.params.caseAddress
  console.log(caseAddress)
  const caseKey = decryptCaseKey(state, currentAccount(), caseAddress)
  console.log(caseKey)
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash'))

  return {
    caseKey,
    diagnosisHash
  }
}

function* saga({ match }) {
  const caseAddress = match.params.caseAddress
  addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'encryptedCaseKey')
  yield cacheCall(caseAddress, 'caseKeySalt')
  yield cacheCall(caseAddress, 'diagnosisALocationHash')
}

export const PatientCaseContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['match']})(class _PatientCase extends Component {
  render() {
    if (this.props.diagnosisHash) {
      var diagnosis =
        <div className='col-xs-12'>
          <Diagnosis
            caseAddress={this.props.match.params.caseAddress}
            caseKey={this.props.caseKey} />
        </div>
    }
    return (
      <MainLayoutContainer>
        <div className="container">
          <div className="row">
            {this.props.caseKey ? (
              <div className='col-xs-12'>
                <CaseStatus caseAddress={this.props.match.params.caseAddress}/>
              </div>
            ) : null}

            {diagnosis}
            <div className='col-xs-12'>
              <ChallengedDiagnosis
                caseAddress={this.props.match.params.caseAddress}
                caseKey={this.props.caseKey}
                title='Second Diagnosis' />
            </div>
            <div className='col-xs-12'>
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
