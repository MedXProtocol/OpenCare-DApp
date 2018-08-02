import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { currentAccount } from '~/services/sign-in'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { isBlank } from '~/utils/isBlank'
import { downloadJson } from '~/utils/storage-util'
import { cacheCallValue, withSaga, cacheCall, addContract } from '~/saga-genesis'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { toastr } from '~/toastr'
import get from 'lodash.get'

function mapStateToProps(state, { caseAddress, challengingDoctorAddress }) {
  const account = currentAccount()
  const bytesChallengeHash = cacheCallValue(state, caseAddress, 'challengeHash')
  const challengeHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'challengeHash'))
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const isPatient = account.address() === patientAddress
  const isChallengingDoctor = account.address() === challengingDoctorAddress

  const networkId = get(state, 'sagaGenesis.network.networkId')

  console.log('patient gets bytesChallengeHash', bytesChallengeHash)
  console.log('patient gets challengeHash', challengeHash)

  return {
    isChallengingDoctor,
    challengeHash,
    isPatient,
    networkId
  }
}

function* saga({ caseAddress, networkId }) {
  if (!networkId) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'challengeHash')
  yield cacheCall(caseAddress, 'patient')
}

const ChallengedDiagnosis = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: [ 'caseAddress', 'challengeHash', 'networkId' ] })(
    class _ChallengedDiagnosis extends Component {

  constructor(props){
    super(props)

    this.state = {
      diagnosis: {},
      hidden: true,
      cancelableDownloadPromise: undefined
    }
  }

  componentDidMount () {
    this.getSecondDiagnosis(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getSecondDiagnosis(nextProps)
  }

  componentWillUnmount() {
    if (this.state.cancelableDownloadPromise) {
      this.state.cancelableDownloadPromise.cancel()
    }
  }

  async getSecondDiagnosis (props) {
    const isPatientOrChallengingDoctor = (props.isPatient || props.isChallengingDoctor)
    if (
      this.state.cancelableDownloadPromise
      || !isEmptyObject(this.state.diagnosis)
      || isBlank(props.challengeHash)
      || isBlank(props.caseKey)
      || !isPatientOrChallengingDoctor
    ) {
      return
    }

    try {
      const cancelableDownloadPromise = cancelablePromise(
        new Promise(async (resolve, reject) => {
          const diagnosisJson = await downloadJson(props.challengeHash, props.caseKey)

          if (diagnosisJson) {
            const diagnosis = JSON.parse(diagnosisJson)
            return resolve({ diagnosis })
          } else {
            console.log(diagnosisJson)
            return reject('There was an error')
          }
        })
      )

      this.setState({ cancelableDownloadPromise })

      cancelableDownloadPromise
        .promise
        .then((result) => {
          this.setState(result)
        })
        .catch((reason) => {
          console.log('isCanceled', reason.isCanceled)
        })
        .finally(() => {
          this.setState({
            loading: false
          })
        })

    } catch (error) {
      toastr.error('There was an error while downloading the diagnosis from IPFS.')
      console.warn(error)
    }
  }

  render () {
    return (
      isEmptyObject(this.state.diagnosis) ?
      <div /> : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{this.props.title}</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-xs-12">
                <label>Diagnosis</label>
                <p>{this.state.diagnosis.diagnosis}</p>
              </div>
              <div className="col-xs-12">
                <label>Recommendation</label>
                <p>{this.state.diagnosis.recommendation}</p>
              </div>
              {(this.state.diagnosis.additionalRecommendation)
                ? (
                    <div className="col-xs-12">
                      <label>Additional Recommendation:</label>
                      <p>{this.state.diagnosis.additionalRecommendation}</p>
                    </div>
                  )
                : null}
            </div>
          </div>
        </div>
      )
    )
  }
}))

ChallengedDiagnosis.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.string,
  title: PropTypes.string,
  challengingDoctorAddress: PropTypes.string
}

ChallengedDiagnosis.defaultProps = {
  caseAddress: null,
  title: 'Diagnosis',
  challengingDoctorAddress: ''
}

export default ChallengedDiagnosis
