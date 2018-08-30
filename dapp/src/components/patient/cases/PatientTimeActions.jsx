import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Modal } from 'react-bootstrap'
import ReactTooltip from 'react-tooltip'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { currentAccount } from '~/services/sign-in'
import { all, put } from 'redux-saga/effects'
import {
  addContract,
  contractByName,
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  withSaga,
  addLogListener,
  removeLogListener,
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'
import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'
import { DoctorSelect } from '~/components/DoctorSelect'
import { Loading } from '~/components/Loading'
import { caseStale } from '~/services/caseStale'
import { reencryptCaseKeyAsync } from '~/services/reencryptCaseKey'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import { computeChallengeFee } from '~/utils/computeChallengeFee'
import { EtherFlip } from '~/components/EtherFlip'
import { isBlank } from '~/utils/isBlank'
import { isTrue } from '~/utils/isTrue'
import { caseStatus } from '~/utils/caseStatus'
import get from 'lodash.get'
import { caseFinders } from '~/finders/caseFinders'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress }) {
  if (!caseAddress) { return {} }

  const address = get(state, 'sagaGenesis.accounts[0]')

  const CaseLifecycleManager = contractByName(state, 'CaseLifecycleManager')
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')

  const secondsInADay = cacheCallValueInt(state, CaseScheduleManager, 'secondsInADay')
  const status = cacheCallValueInt(state, caseAddress, 'status')
  const updatedAt = cacheCallValueInt(state, CaseScheduleManager, 'updatedAt', caseAddress)
  const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
  const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
  const encryptedCaseKey = caseFinders.encryptedCaseKey(state, caseAddress)
  const caseKeySalt = caseFinders.caseKeySalt(state, caseAddress)
  const caseFeeWei = cacheCallValue(state, caseAddress, 'caseFee')

  const transactions = state.sagaGenesis.transactions
  const currentlyExcludedDoctors = state.nextAvailableDoctor.excludedAddresses

  const excludeAddresses = []
  if (address) {
    excludeAddresses.push(address)
  }
  if (!isBlank(diagnosingDoctor)) {
    excludeAddresses.push(diagnosingDoctor)
  }
  if (!isBlank(challengingDoctor)) {
    excludeAddresses.push(challengingDoctor)
  }

  return {
    address,
    secondsInADay,
    caseFeeWei,
    CaseLifecycleManager,
    excludeAddresses,
    CaseScheduleManager,
    currentlyExcludedDoctors,
    challengingDoctor,
    diagnosingDoctor,
    encryptedCaseKey,
    caseKeySalt,
    status,
    transactions,
    updatedAt,
  }
}

function* saga({ CaseScheduleManager, caseAddress }) {
  if (!caseAddress || !CaseScheduleManager) { return }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield put(addLogListener(caseAddress))
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(CaseScheduleManager, 'secondsInADay'),
    cacheCall(CaseScheduleManager, 'updatedAt', caseAddress),
    cacheCall(caseAddress, 'diagnosingDoctor'),
    cacheCall(caseAddress, 'challengingDoctor'),
    cacheCall(caseAddress, 'caseFee')
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchExcludedDoctors: (excludedAddresses) => {
      dispatch({ type: 'EXCLUDED_DOCTORS', excludedAddresses })
    },
    dispatchRemoveLogListener: (address) => {
      dispatch(removeLogListener(address))
    }
  }
}

const PatientTimeActions = connect(mapStateToProps, mapDispatchToProps)(
  withSend(withSaga(saga)(
    class _PatientTimeActions extends Component {

    static propTypes = {
      caseAddress: PropTypes.string.isRequired,
      status: PropTypes.number,
      updatedAt: PropTypes.number
    }

    constructor(props) {
      super(props)

      this.state = {
        loading: false,
        showRequestNewDoctorModal: false,
        doctorPublicKey: '',
      }

      props.dispatchExcludedDoctors(props.excludeAddresses)
    }

    componentWillReceiveProps (nextProps) {
      this.acceptDiagnosisTransactionStateHandler(nextProps)
      this.requestNewDocTransactionStateHandler(nextProps)
      this.withdrawTransactionStateHandler(nextProps)

      if (nextProps.excludeAddresses.length !== this.props.excludeAddresses.length) {
        this.props.dispatchExcludedDoctors(nextProps.excludeAddresses)
      }
    }

    componentWillUnmount () {
      this.props.dispatchRemoveLogListener(this.props.caseAddress)
    }

    onChangeDoctor = (option) => {
      this.setState({
        selectedDoctor: option,
        doctorAddressError: ''
      })
    }

    handleCloseRequestNewDoctorModal = () => {
      this.setState({
        showRequestNewDoctorModal: false,
        selectedDoctor: null,
        doctorAddressError: ''
      })
    }

    handleShowRequestNewDoctorModal = () => {
      this.setState({ showRequestNewDoctorModal: true })
    }

    handlePatientAcceptDiagnosis = () => {
      const acceptDiagnosisTransactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'acceptDiagnosis',
        this.props.caseAddress
      )()

      this.setState({
        acceptDiagnosisTransactionId,
        acceptDiagnosisTransactionStateHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    handlePatientWithdraw = () => {
      const withdrawTransactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'patientWithdrawFunds',
        this.props.caseAddress
      )()

      this.setState({
        withdrawTransactionId,
        withdrawTransactionStateHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    onSubmitRequestNewDoctor = async (e) => {
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

        let contractMethod = 'patientRequestNewInitialDoctor'
        if (this.props.status === caseStatus('Challenging')) {
          contractMethod = 'patientRequestNewChallengeDoctor'
        }

        const requestNewDocTransactionId = this.props.send(
          this.props.CaseLifecycleManager,
          contractMethod,
          this.props.caseAddress,
          this.state.selectedDoctor.value,
          '0x' + doctorEncryptedCaseKey
        )()
        this.setState({
          showRequestNewDoctorModal: false,
          requestNewDocTransactionId,
          requestNewDocTransactionStateHandler: new TransactionStateHandler(),
          loading: true
        })
      }
    }

    acceptDiagnosisTransactionStateHandler = (props) => {
      if (this.state.acceptDiagnosisTransactionStateHandler) {
        this.state.acceptDiagnosisTransactionStateHandler.handle(props.transactions[this.state.acceptDiagnosisTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ acceptDiagnosisTransactionStateHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success("Your 'Accept Diagnosis' transaction has been broadcast to the network. It will take a few moments to be confirmed and then you will receive your deposit back.")
            mixpanel.track('Patient Accepted Diagnosis After 24+ Hours')
            this.props.history.push(routes.PATIENTS_CASES)
          })
      }
    }

    withdrawTransactionStateHandler = (props) => {
      if (this.state.withdrawTransactionStateHandler) {
        this.state.withdrawTransactionStateHandler.handle(props.transactions[this.state.withdrawTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ withdrawTransactionStateHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success("Your 'Withdraw Funds' transaction has been broadcast to the network. It will take a moment to be confirmed and then you will receive your deposit back.")
            mixpanel.track('Patient Withdrew Funds After 24+ Hours')
            this.props.history.push(routes.PATIENTS_CASES)
          })
      }
    }

    requestNewDocTransactionStateHandler = (props) => {
      if (this.state.requestNewDocTransactionStateHandler) {
        this.state.requestNewDocTransactionStateHandler.handle(props.transactions[this.state.requestNewDocTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ requestNewDocTransactionStateHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success("Your 'New Doctor Request' transaction has been broadcast to the network. It will take a few moments to confirm.")
            mixpanel.track('Patient Request New Doc After 24+ Hours')
            this.props.history.push(routes.PATIENTS_CASES)
          })
      }
    }

    render () {
      const { diagnosingDoctor, account, updatedAt, status, secondsInADay } = this.props
      const challengeFeeEther = <EtherFlip wei={computeChallengeFee(this.props.caseFeeWei)} />
      let followUpText = 'You can close the case and withdraw your deposit or assign to a different doctor:'

      const isCaseNotStale = !updatedAt || !caseStale(updatedAt, status, 'patient', secondsInADay)

      let buttons = (
        <div className="button-set__btn-clear">
          <Button
            disabled={this.state.loading}
            onClick={this.handlePatientWithdraw}
            className="btn btn-sm btn-clear"
          >
            Close Case &amp; Withdraw Funds
          </Button>
          <Button
            disabled={this.state.loading}
            onClick={this.handleShowRequestNewDoctorModal}
            className="btn btn-sm btn-clear"
          >
            Assign to Another Doctor
          </Button>
        </div>
      )

      if (status === caseStatus('Challenging')) {
        followUpText = 'You can accept the initial diagnosis or assign to a different doctor:'
        buttons = (
          <div className="button-set__btn-clear">
            <Button
              disabled={this.state.loading}
              onClick={this.handlePatientAcceptDiagnosis}
              className="btn btn-sm btn-clear"
            >
              Accept Initial Diagnosis<br /> (Withdraw {challengeFeeEther})
            </Button>
            <Button
              disabled={this.state.loading}
              onClick={this.handleShowRequestNewDoctorModal}
              className="btn btn-sm btn-clear"
            >
              Assign Second Opinion to<br /> Another Doctor
            </Button>
          </div>
        )
      }
      if (isCaseNotStale) {
        return null
      } else {
        return (
          <React.Fragment>
            <div className='container'>
              <div className='row'>
                <div className='col-xs-12'>
                  <div className="alert alert-warning text-center">
                    <br />
                    24+ hours have passed and the Doctor has yet to respond to your case.
                    <br />{followUpText}

                    {buttons}
                  </div>
                </div>
              </div>
            </div>


            <Modal show={this.state.showRequestNewDoctorModal} onHide={this.handleCloseRequestNewDoctorModal}>
              <form onSubmit={this.onSubmitRequestNewDoctor}>
                <Modal.Header>
                  <Modal.Title>
                    Request New Doctor
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className='row'>
                    <div className='col-xs-12'>
                      <div className={classnames('form-group', { 'has-error': !!this.state.doctorAddressError })}>
                        {isTrue(process.env.REACT_APP_FEATURE_MANUAL_DOCTOR_SELECT)
                          ?
                          <div>
                            <label className='control-label'>Select Another Doctor</label>
                            <DoctorSelect
                              excludeAddresses={[diagnosingDoctor, account]}
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
                            value={this.state.selectedDoctor}
                            onChange={this.onChangeDoctor}
                          />
                         }
                      </div>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    onClick={this.handleCloseRequestNewDoctorModal}
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
          </React.Fragment>
        )
      }
    }
  }
)))

export const PatientTimeActionsContainer = withRouter(PatientTimeActions)
