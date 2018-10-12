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
  contractByName,
  withSaga,
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  withSend,
  LogListener,
  addContract,
  TransactionStateHandler
} from 'saga-genesis'
import { connect } from 'react-redux'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { computeTotalFee } from '~/utils/computeTotalFee'
import { computeChallengeFee } from '~/utils/computeChallengeFee'
import { CaseFee } from '~/components/CaseFee'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { isBlank } from '~/utils/isBlank'
import { downloadJson } from '~/utils/storage-util'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { DiagnosisDisplay } from '~/components/DiagnosisDisplay'
import { reencryptCaseKeyAsync } from '~/services/reencryptCaseKey'
import { mixpanel } from '~/mixpanel'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'
import { NextAvailableDoctor } from '~/components/NextAvailableDoctor'
import {
  caseFinders,
  caseManagerFinders
} from '~/finders'
import get from 'lodash.get'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const CaseLifecycleManager = contractByName(state, 'CaseLifecycleManager')

  const address = state.sagaGenesis.accounts[0]
  const status = cacheCallValueInt(state, caseAddress, 'status')
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const encryptedCaseKey = caseFinders.encryptedCaseKey(state, caseAddress)
  const caseKeySalt = caseFinders.caseKeySalt(state, caseAddress)
  const diagnosisHash = getFileHashFromBytes(caseFinders.diagnosisHash(state, caseAddress))
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
  const doctor = get(state, 'nextAvailableDoctor.doctor')
  const caseFeeWei = cacheCallValue(state, caseAddress, 'caseFee')
  const transactions = state.sagaGenesis.transactions
  const isPatient = address === patientAddress
  const currentlyExcludedDoctors = state.nextAvailableDoctor.excludedAddresses
  const fromBlock = caseManagerFinders.caseFromBlock(state, caseAddress)

  const excludeAddresses = []
  if (address) {
    excludeAddresses.push(address.toLowerCase())
  }
  if (diagnosingDoctor) {
    excludeAddresses.push(diagnosingDoctor.toLowerCase())
  }
  if (challengingDoctor) {
    excludeAddresses.push(challengingDoctor.toLowerCase())
  }

  const networkId = get(state, 'sagaGenesis.network.networkId')

  return {
    CaseLifecycleManager,
    doctor,
    address,
    fromBlock,
    currentlyExcludedDoctors,
    challengingDoctor,
    excludeAddresses,
    status,
    caseFeeWei,
    diagnosisHash,
    transactions,
    isPatient,
    encryptedCaseKey,
    caseKeySalt,
    diagnosingDoctor,
    networkId
  }
}

function* saga({ caseAddress, networkId }) {
  if (!networkId) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(caseAddress, 'patient'),
    cacheCall(caseAddress, 'caseFee'),
    cacheCall(caseAddress, 'diagnosingDoctor'),
    cacheCall(caseAddress, 'challengingDoctor')
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchExcludedDoctors: (excludedAddresses) => {
      dispatch({ type: 'EXCLUDED_DOCTORS', excludedAddresses })
    }
  }
}

const Diagnosis = connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    withSend(class _Diagnosis extends Component {

  constructor(props){
    super(props)

    this.state = {
      diagnosis: {},
      showChallengeModal: false,
      doctorPublicKey: '',
      loading: false,
      cancelableDownloadPromise: undefined
    }

    this.props.dispatchExcludedDoctors(props.excludeAddresses)
  }

  componentDidMount () {
    this.getInitialDiagnosis(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getInitialDiagnosis(nextProps)

    if (nextProps.excludeAddresses.length !== this.props.excludeAddresses.length) {
      this.props.dispatchExcludedDoctors(nextProps.excludeAddresses)
    }

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
      console.warn('Warn in Diagnosis from IPFS.' + error)
    }
  }

  subscribeChallengeHandler = (props) => {
    if (this.state.challengeHandler) {
      this.state.challengeHandler.handle(props.transactions[this.state.challengeTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ challengeHandler: null, loading: false })
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
          toastr.success('You have accepted the case diagnosis. Thank you for using OpenCare!')
          mixpanel.track('Accept Diagnosis Submitted')
          this.props.history.push(routes.PATIENTS_CASES)
        })
    }
  }

  handleAcceptDiagnosis = () => {
    const acceptTransactionId = this.props.send(
      this.props.CaseLifecycleManager,
      'acceptDiagnosis',
      this.props.caseAddress
    )()
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
      doctorAddressError: ''
    })
  }

  onSubmitChallenge = async (e) => {
    e.preventDefault()
    this.setState({ doctorAddressError: '' })
    if (!this.props.doctor) {
      this.setState({
        doctorAddressError: 'You must select a doctor to challenge the case'
      })
    } else {
      const encryptedCaseKey = this.props.encryptedCaseKey.substring(2)
      const doctorPublicKey = this.props.doctor.publicKey.substring(2)
      const caseKeySalt = this.props.caseKeySalt.substring(2)
      const doctorEncryptedCaseKey = await reencryptCaseKeyAsync({
        account: currentAccount(),
        encryptedCaseKey,
        doctorPublicKey,
        caseKeySalt
      })
      const challengeTransactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'challengeWithDoctor',
        this.props.caseAddress,
        this.props.doctor.address,
        '0x' + doctorEncryptedCaseKey
      )()

      this.setState({
        showChallengeModal: false,
        challengeTransactionId,
        challengeHandler: new TransactionStateHandler(),
        loading: true
      })
    }
  }

  render() {
    if (this.props.diagnosingDoctor === undefined || this.props.address === undefined) {
      return null
    }

    const transactionRunning = !!this.state.challengeHandler || !!this.state.acceptHandler
    const buttonsHidden = transactionRunning || !this.props.isPatient || this.props.status !== 3
    const challengeFeeEtherNoFlip = <CaseFee address={this.props.caseAddress} calc={computeChallengeFee} noFlip />
    const challengeFeeEther = <CaseFee address={this.props.caseAddress} calc={computeChallengeFee} />
    const totalFeeEther = <CaseFee address={this.props.caseAddress} calc={computeTotalFee} />

    if (!buttonsHidden) {
      var buttons =
        <div className="card-footer">
          <div className="row">
            <div className="col-xs-12 button-container">
              <button
                disabled={transactionRunning}
                onClick={this.handleChallengeDiagnosis}
                type="button"
                className="btn btn-warning"
              >
                Get Second Opinion
              </button>
              &nbsp;
              <br className="visible-xs hidden-sm hidden-md hidden-lg" />
              <br className="visible-xs hidden-sm hidden-md hidden-lg" />
              <button
                disabled={transactionRunning}
                onClick={this.handleAcceptDiagnosis}
                type="button"
                className="btn btn-success"
              >
                Accept and Withdraw ({challengeFeeEtherNoFlip})
              </button>
            </div>
          </div>
        </div>
    }

    const result = (
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
                      If the diagnosis is the same, you will be charged {totalFeeEther}.  If the diagnosis is different than the original then you'll be charged {challengeFeeEther} and refunded the remainder.
                    </p>
                    <hr />
                    <div className={classnames('form-group', { 'has-error': !!this.state.doctorAddressError })}>
                      <NextAvailableDoctor />
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
                <span data-tip={!this.props.doctor ? 'No available doctors to receive a second opinion from' : ''}>
                  <input
                    disabled={!this.props.doctor}
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

    return <LogListener address={this.props.caseAddress} fromBlock={this.props.fromBlock}>{result}</LogListener>
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
