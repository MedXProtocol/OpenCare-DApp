import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import classnames from 'classnames'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { currentAccount } from '~/services/sign-in'
import { downloadJson } from '~/utils/storage-util'
import { Loading } from '~/components/Loading'
import { withSaga, cacheCall, cacheCallValue, withSend, addContract } from '~/saga-genesis'
import { connect } from 'react-redux'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { isBlank } from '~/utils/isBlank'
import { DoctorSelect } from '~/components/DoctorSelect'
import { reencryptCaseKey } from '~/services/reencryptCaseKey'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'

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
  return {
    account,
    status,
    diagnosisHash,
    transactions,
    isPatient,
    encryptedCaseKey,
    caseKeySalt,
    diagnosingDoctor,
    selectedDoctor: ''
  }
}

function* saga({ caseAddress }) {
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'status')
  yield cacheCall(caseAddress, 'patient')
  yield cacheCall(caseAddress, 'diagnosisHash')
  yield cacheCall(caseAddress, 'encryptedCaseKey')
  yield cacheCall(caseAddress, 'caseKeySalt')
  yield cacheCall(caseAddress, 'diagnosingDoctor')
}

const Diagnosis = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(withSend(class _Diagnosis extends Component {
  constructor(){
    super()

    this.state = {
      diagnosis: {},
      hidden: true,
      showThankYouModal: false,
      showChallengeModal: false,
      doctorAddress: '',
      doctorPublicKey: ''
    }
  }

  async componentDidMount() {
    if (!this.state.hidden || isBlank(this.props.diagnosisHash) || isBlank(this.props.caseKey)) { return }
    const diagnosisJson = await downloadJson(this.props.diagnosisHash, this.props.caseKey)
    const diagnosis = JSON.parse(diagnosisJson)
    this.setState({
      diagnosis,
      doctorAddress: '',
      hidden: false
    })
  }

  componentWillReceiveProps (props) {
    if (this.state.challengeHandler) {
      this.state.challengeHandler.handle(props.transactions[this.state.challengeTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({challengeHandler: null})
        })
        .onTxHash(() => {
          toastr.success('Your case is being challenged')
          mixpanel.track('Challenge Diagnosis Submitted')
          this.setState({
            challengeHandler: null
          })
        })
    }
    if (this.state.acceptHandler) {
      this.state.acceptHandler.handle(props.transactions[this.state.acceptTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({acceptHandler: null})
        })
        .onTxHash(() => {
          toastr.success('Your case has been accepted')
          mixpanel.track('Accept Diagnosis Submitted')
          this.setState({
            acceptHandler: null,
            showThankYouModal: true
          })
        })
    }
  }

  handleAcceptDiagnosis = () => {
    const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptDiagnosis')()
    this.setState({
      acceptTransactionId,
      acceptHandler: new TransactionStateHandler()
    })
  }

  handleChallengeDiagnosis = () => {
    this.setState({
      showChallengeModal: true
    })
  }

  handleCloseThankYouModal = (event) => {
    event.preventDefault()
    this.setState({showThankYouModal: false})
    this.props.history.push(routes.PATIENTS_CASES)
  }

  handleCloseChallengeModal = (event) => {
    event.preventDefault()
    this.setState({
      showChallengeModal: false,
      selectedDoctor: null,
      doctorAddressError: ''
    })
  }

  onSubmitChallenge = (e) => {
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
      const doctorEncryptedCaseKey = reencryptCaseKey({
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
        challengeHandler: new TransactionStateHandler()
      })
    }
  }

  render() {
    const buttonsHidden = !this.props.isPatient || this.props.status !== '3'
    const transactionRunning = !!this.state.challengeHandler || !!this.state.acceptHandler

    if (!buttonsHidden) {
      var buttons =
        <div className="card-footer">
          <hr/>
          <div className="row">
            <div className="col-xs-12 text-right" >
              <button disabled={transactionRunning} onClick={this.handleChallengeDiagnosis} type="button" className="btn btn-warning">Get Second Opinion</button>
              &nbsp;
              <button disabled={transactionRunning} onClick={this.handleAcceptDiagnosis} type="button" className="btn btn-success">Accept</button>
            </div>
          </div>
        </div>
    }

    return (
      this.state.hidden ?
      <div /> :
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Diagnosis</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-xs-12">
              <label>Diagnosis</label>
              <p>
                {this.state.diagnosis.diagnosis}
              </p>
            </div>
            <div className="col-xs-12">
              <label>Recommendation</label>
              <p>
                {this.state.diagnosis.recommendation}
              </p>
            </div>
            {this.state.diagnosis.additionalRecommendation
              ? (
                  <div className="col-xs-12">
                    <label>Additional Recommendation:</label>
                    <p>
                      {this.state.diagnosis.additionalRecommendation}
                    </p>
                  </div>
                )
              : null}
          </div>
        </div>

        {buttons}

        <Modal show={this.state.showThankYouModal} onHide={this.handleCloseThankYouModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>Thank you for using MedCredits!</h4>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCloseThankYouModal} type="button" className="btn btn-primary">OK</button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showChallengeModal} onHide={this.handleCloseChallengeModal}>
          <form onSubmit={this.onSubmitChallenge}>
            <Modal.Body>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <Alert bsStyle='info'>
                    <h3>
                      Challenge Case
                    </h3>
                  </Alert>
                </div>
              </div>
              <div className='row'>
                <div className='col-xs-12'>
                  <p>
                    Challenge the diagnosis by having another doctor look at your case.
                  </p>
                  <p>
                    If the diagnosis is the same, you will be charged 15 MEDX.  If the diagnosis is different than the original then you'll be charged 5 MEDX and refunded the remainder.
                  </p>
                  <div className={classnames('form-group', { 'has-error': !!this.state.doctorAddressError })}>
                    <label className='control-label'>Select Another Doctor</label>
                    <DoctorSelect
                      excludeDoctorAddresses={[this.props.diagnosingDoctor, this.props.account]}
                      value={this.state.selectedDoctor}
                      onChange={(option) => {
                        this.setState({
                          selectedDoctor: option,
                          doctorAddressError: ''
                        })
                      }}
                      required />
                    {!this.state.doctorAddressError ||
                      <p className='help-block has-error'>
                        {this.state.doctorAddressError}
                      </p>
                    }
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button onClick={this.handleCloseChallengeModal} type="button" className="btn btn-link">Cancel</button>
              <input type='submit' className="btn btn-primary" value='OK' />
            </Modal.Footer>
          </form>
        </Modal>

        <Loading loading={transactionRunning} />
      </div>
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
