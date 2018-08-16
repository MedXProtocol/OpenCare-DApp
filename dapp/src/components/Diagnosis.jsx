import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import { Modal } from 'react-bootstrap'
import { all } from 'redux-saga/effects'
import classnames from 'classnames'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { currentAccount } from '~/services/sign-in'
import { Loading } from '~/components/Loading'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  withSend,
  addContract,
  TransactionStateHandler
} from '~/saga-genesis'
import { connect } from 'react-redux'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { isTrue } from '~/utils/isTrue'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { isBlank } from '~/utils/isBlank'
import { downloadJson } from '~/utils/storage-util'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { DiagnosisDisplay } from '~/components/DiagnosisDisplay'
import { DoctorSelect } from '~/components/DoctorSelect'
import { reencryptCaseKeyAsync } from '~/services/reencryptCaseKey'
import { mixpanel } from '~/mixpanel'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'
import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'
import isEqual from 'lodash.isequal'
import get from 'lodash.get'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const account = state.sagaGenesis.accounts[0]
  const status = cacheCallValue(state, caseAddress, 'status')
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')
  const diagnosisHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisHash'))
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const transactions = state.sagaGenesis.transactions
  const isPatient = account === patientAddress
  const currentlyExcludedDoctors = state.nextAvailableDoctor.excludedAddresses

  const networkId = get(state, 'sagaGenesis.network.networkId')

  return {
    account,
    currentlyExcludedDoctors,
    status,
    diagnosisHash,
    transactions,
    isPatient,
    encryptedCaseKey,
    caseKeySalt,
    diagnosingDoctor,
    selectedDoctor: '',
    networkId
  }
}

function* saga({ caseAddress, networkId }) {
  if (!networkId) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(caseAddress, 'patient'),
    cacheCall(caseAddress, 'diagnosisHash'),
    cacheCall(caseAddress, 'encryptedCaseKey'),
    cacheCall(caseAddress, 'caseKeySalt'),
    cacheCall(caseAddress, 'diagnosingDoctor')
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchExcludedDoctors: (addresses) => {
      dispatch({ type: 'EXCLUDED_DOCTORS', addresses })
    }
  }
}

const Diagnosis = connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    withSend(class _Diagnosis extends Component {

  constructor(){
    super()

    this.state = {
      diagnosis: {},
      showChallengeModal: false,
      doctorPublicKey: '',
      loading: false,
      cancelableDownloadPromise: undefined
    }
  }

  componentDidMount () {
    this.getInitialDiagnosis(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getInitialDiagnosis(nextProps)

    this.setExcludedDoctorAddresses(nextProps)

    this.subscribeChallengeHandler(nextProps)
    this.acceptChallengeHandler(nextProps)
  }

  componentWillUnmount () {
    if (this.state.cancelableDownloadPromise) {
      this.state.cancelableDownloadPromise.cancel()
    }
  }

  async getInitialDiagnosis (props) {
    if (
      this.state.cancelableDownloadPromise
      || !isEmptyObject(this.state.diagnosis)
      || isBlank(props.diagnosisHash)
      || isBlank(props.caseKey)
    ) { return }

    try {
      const cancelableDownloadPromise = cancelablePromise(
        new Promise(async (resolve, reject) => {
          const diagnosisJson = await downloadJson(props.diagnosisHash, props.caseKey)

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
          this.setState({
            loading: false
          })
        })
        .catch((reason) => {
          console.log('isCanceled', reason.isCanceled)
        })
    } catch (error) {
      toastr.error('There was an error while downloading the diagnosis from IPFS.')
      console.warn(error)
    }
  }

  setExcludedDoctorAddresses = (props) => {
    if (props.diagnosingDoctor && props.currentlyExcludedDoctors) {
      const excludeAddresses = [props.diagnosingDoctor, props.account]

      if (!isEqual(excludeAddresses, props.currentlyExcludedDoctors)) {
        props.dispatchExcludedDoctors(excludeAddresses)
      }
    }
  }

  subscribeChallengeHandler = (props) => {
    if (this.state.challengeHandler) {
      this.state.challengeHandler.handle(props.transactions[this.state.challengeTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ challengeHandler: null, loading: false })
        })
        .onConfirmed(() => {
          this.setState({ challengeHandler: null })
        })
        .onTxHash(() => {
          toastr.success('Working on getting you a second opinion.')
          mixpanel.track('Challenge Diagnosis Submitted')
          this.props.history.push(routes.PATIENTS_CASES)
        })
    }
  }

  acceptChallengeHandler = (props) => {
    if (this.state.acceptHandler) {
      this.state.acceptHandler.handle(props.transactions[this.state.acceptTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ acceptHandler: null, loading: false })
        })
        .onConfirmed(() => {
          this.setState({
            acceptHandler: null
          })
        })
        .onTxHash(() => {
          toastr.success('You have accepted the case diagnosis. Thank you for using MedCredits!')
          mixpanel.track('Accept Diagnosis Submitted')
          this.props.history.push(routes.PATIENTS_CASES)
        })
    }
  }

  onChangeDoctor = (option) => {
    this.setState({
      selectedDoctor: option,
      doctorAddressError: ''
    })
  }

  handleAcceptDiagnosis = () => {
    const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptDiagnosis')()
    this.setState({
      acceptTransactionId,
      acceptHandler: new TransactionStateHandler(),
      loading: true
    })
  }

  handleChallengeDiagnosis = () => {
    this.setState({ showChallengeModal: true })
  }

  handleCloseChallengeModal = () => {
    this.setState({
      showChallengeModal: false,
      selectedDoctor: null,
      doctorAddressError: ''
    })
  }

  onSubmitChallenge = async (e) => {
    e.preventDefault()
    this.setState({ doctorAddressError: '' })
    if (!this.state.selectedDoctor) {
      this.setState({
        doctorAddressError: 'You must select a doctor to challenge the case'
      })
    } else {
      const encryptedCaseKey = this.props.encryptedCaseKey.substring(2)
      const doctorPublicKey = this.state.selectedDoctor.publicKey.substring(2)
      const caseKeySalt = this.props.caseKeySalt.substring(2)
      const doctorEncryptedCaseKey = await reencryptCaseKeyAsync({
        account: currentAccount(),
        encryptedCaseKey,
        doctorPublicKey,
        caseKeySalt
      })
      const challengeTransactionId = this.props.send(this.props.caseAddress, 'challengeWithDoctor',
        this.state.selectedDoctor.value,
        '0x' + doctorEncryptedCaseKey)()

      this.setState({
        showChallengeModal: false,
        challengeTransactionId,
        challengeHandler: new TransactionStateHandler(),
        loading: true
      })
    }
  }

  render() {
    const transactionRunning = !!this.state.challengeHandler || !!this.state.acceptHandler
    const buttonsHidden = transactionRunning || !this.props.isPatient || this.props.status !== '3'

    if (!buttonsHidden) {
      var buttons =
        <div className="card-footer">
          <div className="row">
            <div className="col-xs-12 text-right" >
              <button
                disabled={transactionRunning}
                onClick={this.handleChallengeDiagnosis}
                type="button"
                className="btn btn-warning"
              >Get Second Opinion</button>
              &nbsp;
              <button
                disabled={transactionRunning}
                onClick={this.handleAcceptDiagnosis}
                type="button"
                className="btn btn-success"
              >Accept and Withdraw (5 MEDT)</button>
            </div>
          </div>
        </div>
    }

    return (
      isEmptyObject(this.state.diagnosis)
        ? <div />
        : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{this.props.title}</h3>
          </div>
          <div className="card-body">
            <DiagnosisDisplay diagnosis={this.state.diagnosis} />
          </div>

          {buttons}

          <Modal show={this.state.showChallengeModal} onHide={this.handleCloseChallengeModal}>
            <form onSubmit={this.onSubmitChallenge}>
              <Modal.Header>
                <Modal.Title>
                  Challenge Case
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className='row'>
                  <div className='col-xs-12'>
                    <p>
                      Challenge the diagnosis by having another doctor look at your case.
                    </p>
                    <p>
                      If the diagnosis is the same, you will be charged 15 MEDT (Test MEDX).  If the diagnosis is different than the original then you'll be charged 5 MEDT (Test MEDX) and refunded the remainder.
                    </p>
                    <hr />
                    <div className={classnames('form-group', { 'has-error': !!this.state.doctorAddressError })}>
                      {isTrue(process.env.REACT_APP_FEATURE_MANUAL_DOCTOR_SELECT)
                        ?
                        <div>
                          <label className='control-label'>Select Another Doctor</label>
                          <DoctorSelect
                            excludeAddresses={[this.props.diagnosingDoctor, this.props.account]}
                            value={this.state.selectedDoctor}
                            isClearable={false}
                            onChange={this.onChangeDoctor} />
                          {!this.state.doctorAddressError ||
                            <p className='help-block has-error'>
                              {this.state.doctorAddressError}
                            </p>
                          }
                        </div>
                        :
                        <AvailableDoctorSelect
                          excludeAddresses={[this.props.diagnosingDoctor, this.props.account]}
                          value={this.state.selectedDoctor}
                          onChange={this.onChangeDoctor} />
                       }
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button
                  onClick={this.handleCloseChallengeModal}
                  type="button"
                  className="btn btn-link"
                >Cancel</button>
                <span data-tip={!this.state.selectedDoctor ? 'No available doctors to receive a second opinion from' : ''}>
                  <input
                    disabled={!this.state.selectedDoctor}
                    type='submit'
                    className="btn btn-success"
                    value='OK'
                  />
                  <ReactTooltip
                    effect='solid'
                    place={'top'}
                    wrapper='span'
                  />
                </span>
              </Modal.Footer>
            </form>
          </Modal>

          <Loading loading={this.state.loading} />
        </div>
      )
    )
  }
})))

Diagnosis.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.string
}

Diagnosis.defaultProps = {
  caseAddress: null
}

export default withRouter(Diagnosis)
