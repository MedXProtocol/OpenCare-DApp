import React, { Component } from 'react'
import { connect } from 'react-redux'
import { put } from 'redux-saga/effects'
import PropTypes from 'prop-types'
import {
  cacheCallValue,
  withSaga,
  cacheCall,
  addContract,
  addLogListener,
  removeLogListener
} from '~/saga-genesis'
import { currentAccount } from '~/services/sign-in'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { isBlank } from '~/utils/isBlank'
import { caseFinders } from '~/finders/caseFinders'
import { downloadJson } from '~/utils/storage-util'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { DiagnosisDisplay } from '~/components/DiagnosisDisplay'
import { toastr } from '~/toastr'
import get from 'lodash.get'

function mapStateToProps(state, { caseAddress, challengingDoctorAddress }) {
  const account = currentAccount()
  const challengeHash = getFileHashFromBytes(caseFinders.challengeHash(state, caseAddress))
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const isPatient = account.address() === patientAddress
  const isChallengingDoctor = account.address() === challengingDoctorAddress

  const networkId = get(state, 'sagaGenesis.network.networkId')

  return {
    isChallengingDoctor,
    challengeHash,
    isPatient,
    networkId
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchRemoveLogListener: (address) => dispatch(removeLogListener(address))
  }
}

function* saga({ caseAddress, networkId }) {
  if (!networkId) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'patient')
  yield put(addLogListener(caseAddress))
}

const ChallengedDiagnosis = connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
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
    this.props.dispatchRemoveLogListener(this.props.caseAddress)
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
            return reject('There was an error')
          }
        })
      )

      this.setState({ cancelableDownloadPromise })

      cancelableDownloadPromise
        .promise
        .then((result) => {
          this.setState(result)
          this.setState({
            loading: false
          })
        })
        .catch((reason) => {
          // console.log('isCanceled', reason.isCanceled)
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
            <DiagnosisDisplay diagnosis={this.state.diagnosis} />
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
