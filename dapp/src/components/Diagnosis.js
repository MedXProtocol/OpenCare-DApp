import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import Spinner from '~/components/Spinner'
import { downloadJson } from '~/utils/storage-util'
import { withSaga, cacheCall, cacheCallValue, withSend } from '~/saga-genesis'
import { connect } from 'react-redux'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const status = cacheCallValue(state, caseAddress, 'status')
  const diagnosisALocationHash = getFileHashFromBytes(cacheCallValue(state, caseAddress, 'diagnosisALocationHash'))
  const transactions = state.sagaGenesis.transactions
  return {
    status,
    diagnosisALocationHash,
    transactions
  }
}

function* saga({ caseAddress }) {
  yield cacheCall(caseAddress, 'status')
  yield cacheCall(caseAddress, 'diagnosisALocationHash')
}

const Diagnosis = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(withSend(class _Diagnosis extends Component {
  constructor(){
    super()

    this.state = {
      diagnosis: {},
      status: {},
      hidden: true,
      buttonsHidden: true,
      submitInProgress: false,
      showThankYouModal: false,
      showChallengeModal: false
    }
  }

  async componentDidMount() {
    const status = parseInt(this.props.status, 10)

    this.setState({status: status})

    if (status === 5) {
      this.setState({ buttonsHidden: false })
    }

    const diagnosisHash = this.props.diagnosisALocationHash

    if (diagnosisHash !== null && diagnosisHash !== "0x") {
      const diagnosisJson = await downloadJson(diagnosisHash, this.props.caseKey);
      const diagnosis = JSON.parse(diagnosisJson);
      this.setState({
        diagnosis: diagnosis,
        hidden: false
      });
    }
  }

  componentWillReceiveProps (props) {
    if (this.state.acceptTransactionId && props.transactions[this.state.acceptTransactionId].complete) {
      this.onAcceptSuccess()
    }
    if (this.state.challengeTransactionId && props.transactions[this.state.challengeTransactionId].complete) {
      this.onChallengeSuccess()
    }
  }

  handleAcceptDiagnosis = () => {
    const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptDiagnosis')()
    this.setState({
      submitInProgress: true,
      acceptTransactionId
    });
  }

  handleChallengeDiagnosis = () => {
    const challengeTransactionId = this.props.send(this.props.caseAddress, 'challengeDiagnosis')()
    this.setState({
      submitInProgress: true,
      challengeTransactionId
    });
  }

  handleCloseThankYouModal = (event) => {
      event.preventDefault();
      this.setState({showThankYouModal: false});
      this.props.history.push('/patients/cases');
  }

  handleCloseChallengeModal = (event) => {
      event.preventDefault();
      this.setState({showChallengeModal: false});
      this.props.history.push('/patients/cases');
  }

  onAcceptSuccess = () => {
    this.setState({
      acceptTransactionId: null,
      submitInProgress: false,
      showThankYouModal: true
    });
  }

  onChallengeSuccess = () => {
    this.setState({
      challengeTransactionId: null,
      submitInProgress: false,
      showChallengeModal: true
    });
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
            {(this.state.diagnosis.additionalRecommendation.length > 0)
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
        <Spinner loading={this.state.submitInProgress}/>
      </div>
    );
  }
})))

Diagnosis.propTypes = {
    caseAddress: PropTypes.string,
    caseKey: PropTypes.string
};

Diagnosis.defaultProps = {
    caseAddress: null
};

export default withRouter(Diagnosis);
