import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { downloadJson } from '~/utils/storage-util'
import { withSaga, cacheCall, cacheCallValue, withSend } from '~/saga-genesis'
import { connect } from 'react-redux'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const account = state.sagaGenesis.accounts[0]
  const status = cacheCallValue(state, caseAddress, 'status')
  const patientAddress = cacheCallValue(state, caseAddress, 'patient')
  const diagnosisALocationHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash'))
  const transactions = state.sagaGenesis.transactions
  const isPatient = account === patientAddress
  return {
    status,
    diagnosisALocationHash,
    transactions,
    isPatient
  }
}

function* saga({ caseAddress }) {
  yield cacheCall(caseAddress, 'status')
  yield cacheCall(caseAddress, 'patient')
  yield cacheCall(caseAddress, 'diagnosisALocationHash')
}

const Diagnosis = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(withSend(class _Diagnosis extends Component {
  constructor(){
    super()

    this.state = {
      diagnosis: {},
      status: '',
      hidden: true,
      buttonsHidden: true,
      showThankYouModal: false,
      showChallengeModal: false
    }
  }

  async componentDidMount() {
    const status = parseInt(this.props.status, 10)
    this.setState({status})
    if (status === 5 && this.props.isPatient) {
      this.setState({ buttonsHidden: false })
    }
    const diagnosisHash = this.props.diagnosisALocationHash
    if (diagnosisHash !== null && diagnosisHash !== "0x" && this.props.caseKey) {
      const diagnosisJson = await downloadJson(diagnosisHash, this.props.caseKey)
      const diagnosis = JSON.parse(diagnosisJson)
      this.setState({
        diagnosis: diagnosis,
        hidden: false
      })
    }
  }

  componentWillReceiveProps (props) {
    if (this.state.challengeHandler) {
      this.state.challengeHandler.handle(props.transactions[this.state.challengeTransactionId])
        .onError(toastr.transactionError)
        .onReceipt(() => {
          toastr.success('Your case is being challenged')
          mixpanel.track('Challenge Diagnosis Submitted')
          this.setState({
            challengeHandler: null,
            showChallengeModal: true
          })
        })
    }

    if (this.state.acceptHandler) {
      this.state.acceptHandler.handle(props.transactions[this.state.acceptTransactionId])
        .onError(toastr.transactionError)
        .onReceipt(() => {
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
    const challengeTransactionId = this.props.send(this.props.caseAddress, 'challengeDiagnosis')()
    this.setState({
      challengeTransactionId,
      challengeHandler: new TransactionStateHandler()
    })
  }

  handleCloseThankYouModal = (event) => {
    event.preventDefault()
    this.setState({showThankYouModal: false})
    this.props.history.push(routes.PATIENTS_CASES)
  }

  handleCloseChallengeModal = (event) => {
    event.preventDefault()
    this.setState({showChallengeModal: false})
    this.props.history.push(routes.PATIENTS_CASES)
  }

  render() {
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
          this.state.buttonsHidden ? null :
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

        <Modal show={this.state.showThankYouModal}>
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

        <Modal show={this.state.showChallengeModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>Another doctor will now review your case.</h4>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCloseChallengeModal} type="button" className="btn btn-primary">OK</button>
          </Modal.Footer>
        </Modal>
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
