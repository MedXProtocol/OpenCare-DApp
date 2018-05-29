import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spinner from '@/components/Spinner';
import { getCaseStatus, getCaseDoctorADiagnosisLocationHash, acceptDiagnosis, challengeDiagnosis } from '@/utils/web3-util';
import { downloadJson } from '@/utils/storage-util';

class Diagnosis extends Component {
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
        };
    }

    async componentDidMount() {
        const status = await getCaseStatus(this.props.caseAddress);

        this.setState({status: status});

        if(status.code === 5) {
            this.setState({buttonsHidden: false});
        }

        const diagnosisHash = await getCaseDoctorADiagnosisLocationHash(this.props.caseAddress);

        if(diagnosisHash !== null && diagnosisHash !== "0x") {
            const diagnosisJson = await downloadJson(diagnosisHash, this.props.caseKey);
            const diagnosis = JSON.parse(diagnosisJson);
            this.setState({
                diagnosis: diagnosis,
                hidden: false
            });
        }
    }

    handleAcceptDiagnosis = async () => {
        this.setState({submitInProgress: true});

        acceptDiagnosis(this.props.caseAddress, (error, result) => {
            if(error !== null) {
                //this.onError(error);
            } else {
                this.onAcceptSuccess();
            }
        });
    }

    handleChallengeDiagnosis = async () => {
        this.setState({submitInProgress: true});

        challengeDiagnosis(this.props.caseAddress, (error, result) => {
            if(error !== null) {
                //this.onError(error);
            } else {
                this.onChallengeSuccess();
            }
        });
    }

    handleCloseThankYouModal = (event) => {
        event.preventDefault();

        this.setState({showThankYouModal: false});

        this.props.history.push('/patient-profile');
    }

    handleCloseChallengeModal = (event) => {
        event.preventDefault();

        this.setState({showChallengeModal: false});

        this.props.history.push('/patient-profile');
    }

    onAcceptSuccess = () => {
        this.setState({
            submitInProgress: false,
            showThankYouModal: true
        });
    }

    onChallengeSuccess = () => {
        this.setState({
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
                <div className="card-content">
                    <div className="row">

                        <div className="col-xs-12">
                            <label>Diagnosis</label>
                            <p>{this.state.diagnosis.diagnosis}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 top10">
                            <label>Recommendation</label>
                            <p>{this.state.diagnosis.recommendation}</p>
                        </div>
                    </div>
                </div>

                {
                    this.state.buttonsHidden ? null :
                    <div className="card-footer">
                        <hr/>
                        <div className="row">
                            <div className="col-xs-12 text-center" >
                                <button onClick={this.handleAcceptDiagnosis} type="button" className="btn btn-success btn-fill">Accept</button>
                                &nbsp;
                                <button onClick={this.handleChallengeDiagnosis} type="button" className="btn btn-danger btn-fill">Get Second Opinion</button>
                            </div>
                        </div>
                    </div>
                }

                <Modal show={this.state.showThankYouModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Thank you for using MedCredits!</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseThankYouModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showChallengeModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Another doctor will now review your case.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseChallengeModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}

Diagnosis.propTypes = {
    caseAddress: PropTypes.string,
    caseKey: PropTypes.string
};

Diagnosis.defaultProps = {
    caseAddress: null
};

export default withRouter(Diagnosis);
