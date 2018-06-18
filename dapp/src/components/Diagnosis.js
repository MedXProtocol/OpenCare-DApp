import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import classnames from 'classnames'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getAccount } from '~/services/sign-in'
import Spinner from '~/components/Spinner'
import { downloadJson } from '~/utils/storage-util'
import { withSaga, cacheCall, cacheCallValue, withSend, addContract } from '~/saga-genesis'
import { connect } from 'react-redux'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { isBlank } from '~/utils/isBlank'
import { DoctorSelect } from '~/components/DoctorSelect'
import { reencryptCaseKey } from '~/services/reencryptCaseKey'
import { TransactionEvents } from '~/saga-genesis/TransactionEvents'

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
    diagnosingDoctor
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
      status: {},
      hidden: true,
      submitInProgress: false,
      showThankYouModal: false,
      showChallengeModal: false,
      doctorAddress: '',
      doctorPublicKey: ''
    }
  }

  async componentDidMount() {
    if (this.state.diagnosis || isBlank(this.props.diagnosisHash)) { return }
    const diagnosisJson = await downloadJson(this.props.diagnosisHash, this.props.caseKey)
    const diagnosis = JSON.parse(diagnosisJson)
    this.setState({
      diagnosis,
      hidden: false
    })
  }

  componentWillReceiveProps (props) {
    if (this.state.challengeEvents) {
      this.state.challengeEvents.check(props.transactions[this.state.challengeTransactionId])
        .onError((error) => {
          this.setState({
            showErrorModal: true,
            message: `There was an error challenging the case: ${error}`
          })
        })
        .onReceipt(() => {
          this.setState({
            challengeTransactionId: null,
            submitInProgress: false
          })
        })
    }

    if (this.state.acceptTransactionId && props.transactions[this.state.acceptTransactionId].complete) {
      this.setState({
        acceptTransactionId: null,
        submitInProgress: false,
        showThankYouModal: true
      })
    }
  }

  handleAcceptDiagnosis = () => {
    const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptDiagnosis')()
    this.setState({
      submitInProgress: true,
      acceptTransactionId
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
    this.props.history.push('/patients/cases')
  }

  handleCloseChallengeModal = (event) => {
    event.preventDefault()
    this.setState({
      showChallengeModal: false,
      doctorAddressError: ''
    })
  }

  onSubmitChallenge = (e) => {
    e.preventDefault()
    this.setState({ doctorAddressError: '' })
    if (!this.state.doctorAddress) {
      this.setState({
        doctorAddressError: 'You must select a doctor to challenge the case'
      })
    } else {
      const encryptedCaseKey = this.props.encryptedCaseKey.substring(2)
      const doctorPublicKey = this.state.doctorPublicKey.substring(2)
      const caseKeySalt = this.props.caseKeySalt.substring(2)
      const doctorEncryptedCaseKey = reencryptCaseKey({
        account: getAccount(),
        encryptedCaseKey,
        doctorPublicKey,
        caseKeySalt
      })
      const challengeTransactionId = this.props.send(this.props.caseAddress, 'challengeWithDoctor',
        this.state.doctorAddress,
        '0x' + doctorEncryptedCaseKey)()

      this.setState({
        showChallengeModal: false,
        submitInProgress: true,
        challengeTransactionId,
        challengeEvents: new TransactionEvents()
      })
    }
  }

  render() {
    const buttonsHidden = !this.props.isPatient || this.props.status !== '3'

    return ( this.state.hidden ?
      <div /> :
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Diagnosis</h2>
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
            {(this.state.diagnosis.additionalRecommendation)
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

        {
          buttonsHidden ? null :
          <div className="card-footer">
            <hr/>
            <div className="row">
              <div className="col-xs-12 text-right" >
                <button onClick={this.handleChallengeDiagnosis} type="button" className="btn btn-warning">Get Second Opinion</button>
                &nbsp;
                <button onClick={this.handleAcceptDiagnosis} type="button" className="btn btn-success">Accept</button>
              </div>
            </div>
          </div>
        }

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
                      selected={this.state.doctorAddress}
                      onChange={(option) => {
                        this.setState({
                          doctorAddress: option.value,
                          doctorPublicKey: option.publicKey,
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
        <Spinner loading={this.state.submitInProgress}/>
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
