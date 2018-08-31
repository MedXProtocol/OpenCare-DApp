import React, { Component } from 'react'
import { connect } from 'react-redux'
import CaseStatus from './CaseStatus'
import Diagnosis from '~/components/Diagnosis'
import { PatientTimeActionsContainer } from '~/components/patient/cases/PatientTimeActions'
import { CaseDetails } from '~/components/CaseDetails'
import ChallengedDiagnosis from '~/components/ChallengedDiagnosis'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { decryptCaseKeyAsync } from '~/services/decrypt-case-key'
import { currentAccount } from '~/services/sign-in'
import {
  withSaga,
  LogListener,
  addContract,
  contractByName
} from '~/saga-genesis'
import {
  caseFinders,
  caseManagerFinders
} from '~/finders'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import get from 'lodash.get'

function mapStateToProps(state, { match }) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const caseAddress = match.params.caseAddress

  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')

  const encryptedCaseKey = caseFinders.encryptedCaseKey(state, caseAddress)
  const caseKeySalt = caseFinders.caseKeySalt(state, caseAddress)
  const diagnosisHash = getFileHashFromBytes(caseFinders.diagnosisHash(state, caseAddress))
  const challengeHash = getFileHashFromBytes(caseFinders.challengeHash(state, caseAddress))
  const fromBlock = caseManagerFinders.caseFromBlock(state, caseAddress)

  return {
    fromBlock,
    CaseScheduleManager,
    caseAddress,
    challengeHash,
    diagnosisHash,
    encryptedCaseKey,
    caseKeySalt,
    networkId
  }
}

function* saga({ CaseScheduleManager, match, networkId, fromBlock }) {
  if (!networkId) { return }

  const caseAddress = match.params.caseAddress

  yield addContract({ address: caseAddress, contractKey: 'Case' })
}

export const PatientCaseContainer = connect(mapStateToProps)(
  withSaga(saga)(
    class _PatientCase extends Component {
      constructor (props) {
        super(props)
        this.state = {}
      }

      componentDidMount () {
        this.decryptCaseKey(this.props)
      }

      componentWillReceiveProps (props) {
        this.decryptCaseKey(props)
      }

      decryptCaseKey (props) {
        if (props.encryptedCaseKey && props.caseKeySalt) {
          decryptCaseKeyAsync(currentAccount(), props.encryptedCaseKey, props.caseKeySalt)
            .then(caseKey => {
              this.setState({ caseKey })
            })
        }
      }

      render() {
        const caseKey = this.state.caseKey
        const caseAddress = this.props.match.params.caseAddress
        const { diagnosisHash, challengeHash } = this.props

        if (caseKey) {
          if (diagnosisHash) {
            var diagnosis =
              <div className='col-xs-12'>
                <Diagnosis
                  title='Initial Diagnosis'
                  caseAddress={caseAddress}
                  caseKey={caseKey}
                />
              </div>
          }

          if (challengeHash) {
            var challenge =
              <div className='col-xs-12'>
                <ChallengedDiagnosis
                  title='Second Diagnosis'
                  caseAddress={caseAddress}
                  caseKey={caseKey}
                />
              </div>
          }

          var caseDetails =
            <CaseDetails
              caseAddress={caseAddress}
              caseKey={caseKey}
            />
        }

        return (
          <div>
            <LogListener address={caseAddress} fromBlock={this.props.fromBlock} />
            <ScrollToTop />
            <PageTitle renderTitle={(t) => t('pageTitles.patientCase', { caseId: ('' + caseAddress).substring(0, 10) + ' ...'})} />
            <div className='container'>
              <div className="row">
                {caseKey ? (
                  <div className='col-xs-12'>
                    <CaseStatus caseAddress={caseAddress}/>
                  </div>
                ) : null}

                <PatientTimeActionsContainer caseAddress={caseAddress} />

                {diagnosis}
                {challenge}

                <div className='col-xs-12'>
                  {caseDetails}
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  )
)
