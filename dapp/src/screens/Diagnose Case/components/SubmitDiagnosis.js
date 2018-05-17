import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Spinner from '../../../components/Spinner';
import { isNotEmptyString } from '../../../utils/common-util';
import {
  getCaseStatus,
  getCaseDoctorADiagnosisLocationHash,
  diagnoseCase,
  diagnoseChallengedCase
} from '../../../utils/web3-util';
import { uploadJson, downloadJson } from '../../../utils/storage-util';

class SubmitDiagnosis extends Component {
    constructor(){
        super()

        this.state = {
            isChallenge: false,
            originalDiagnosis: null,

            diagnosis: null,
            recommendation: null,

            canSubmit: false,
            submitInProgress: false,
            showConfirmationModal: false,
            showThankYouModal: false
        };
    }

    async componentDidMount() {
        const status = await getCaseStatus(this.props.caseAddress);

        if(status.code === 4) {

            const diagnosisHash = await getCaseDoctorADiagnosisLocationHash(this.props.caseAddress);

            const diagnosisJson = await downloadJson(diagnosisHash);
            const diagnosis = JSON.parse(diagnosisJson);

            this.setState({
                isChallenge: true,
                originalDiagnosis: diagnosis.diagnosis
            });
        }
    }

    updateDiagnosis = (event) => {
        this.setState({diagnosis: event.target.value}, this.validateInputs);
    }

    updateRecommendation = (event) => {
        this.setState({recommendation: event.target.value}, this.validateInputs);
    }

    validateInputs = () => {
        const valid =
            isNotEmptyString(this.state.diagnosis) &&
            isNotEmptyString(this.state.recommendation);

            this.setState({ canSubmit: valid });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        this.setState({showConfirmationModal: true});
    }

    handleCloseThankYouModal = (event) => {
        event.preventDefault();

        this.setState({showThankYouModal: false});

        this.props.history.push('/physician-profile');
    }

    handleCancelConfirmSubmissionModal = (event) => {
        this.setState({showConfirmationModal: false});
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
        this.setState({showConfirmationModal: false});
        await this.submitDiagnosis();
    }

    submitDiagnosis = async () => {
        this.setState({submitInProgress: true});

        const diagnosisInformation = {
            diagnosis: this.state.diagnosis,
            recommendation: this.state.recommendation
        };

        const diagnosisJson = JSON.stringify(diagnosisInformation);

        const hash = await uploadJson(diagnosisJson);

        if(this.state.isChallenge) {
            const accept = this.state.originalDiagnosis === this.state.diagnosis;

            diagnoseChallengedCase(this.props.caseAddress, hash, accept, (error, result) => {
                if(error !== null) {
                    this.onError(error);
                } else {
                    this.onSuccess();
                }
            });
        } else {
            diagnoseCase(this.props.caseAddress, hash, (error, result) => {
                if(error !== null) {
                    this.onError(error);
                } else {
                    this.onSuccess();
                }
            });
        }
    }

    onError = (error) => {
        this.setState({
            error: error,
            submitInProgress: false
        });

    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
        this.setState({showThankYouModal: true});
    }

    render() {
        return (
            <div className="card">
                <form onSubmit={this.handleSubmit} >
                    <div className="card-header">
                        <h2 className="card-title">
                            Submit Diagnosis
                        </h2>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label>Diagnosis<span className='star'>*</span></label>
                            <select onChange={this.updateDiagnosis} className="form-control">
                                <option value=""></option>
                                <option value="Acne">Acne</option>
                                <option value="Dermatitis">Dermatitis</option>
                                <option value="Alopecia">Alopecia</option>
                                <option value="Actinic Keratosis">Actinic Keratosis</option>
                                <option value="Insect bite/sting">Insect bite/sting</option>
                                <option value="Poison Ivy/Poison Oak">Poison Ivy/Poison Oak</option>
                                <option value="Blister">Blister</option>
                                <option value="Bed Sores">Bed Sores</option>
                                <option value="Cellulitis">Cellulitis</option>
                                <option value="Cold Sores">Cold Sores</option>
                                <option value="Abrasion">Abrasion</option>
                                <option value="Drug Rash">Drug Rash</option>
                                <option value="Dry Skin">Dry Skin</option>
                                <option value="Skin Cancer">Skin Cancer</option>
                                <option value="Benign Skin Growth">Benign Skin Growth</option>
                                <option value="Psoriasis">Psoriasis</option>
                                <option value="Shingles (Herpes Zoster)">Shingles (Herpes Zoster)</option>
                                <option value="Warts">Warts</option>
                                <option value="Sunburn">Sunburn</option>
                                <option value="Seborrheic Keratosis">Seborrheic Keratosis</option>
                                <option value="Herpes Simplex Virus (HSV)">Herpes Simplex Virus (HSV)</option>
                                <option value="Rosacea">Rosacea</option>
                                <option value="Scars">Scars</option>
                                <option value="Nevus">Nevus</option>
                                <option value="Calluses or corns">Calluses or corns</option>
                                <option value="Erythema Multiforme">Erythema Multiforme</option>
                                <option value="Ingrown Hair">Ingrown Hair</option>
                                <option value="Lice">Lice</option>
                                <option value="Seborrheic Dermatitis">Seborrheic Dermatitis</option>
                                <option value="Birthmark">Birthmark</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Recommendation<span className='star'>*</span></label>
                            <textarea onChange={this.updateRecommendation} className="form-control" rows="5" required />
                        </div>
                        <div className="category"><span className='star'>*</span> Required fields</div>
                    </div>
                    <div className="card-footer">
                        <button disabled={!this.state.canSubmit} type="submit" className="btn btn-fill btn-primary">Submit</button>
                    </div>
                </form>
                <Modal show={this.state.showConfirmationModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Are you sure?</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleAcceptConfirmSubmissionModal} type="button" className="btn btn-defult">Yes</button>
                        <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-defult">No</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showThankYouModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Thank you! Your diagnosis submitted successfully.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseThankYouModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}

SubmitDiagnosis.propTypes = {
    caseAddress: PropTypes.string
};

SubmitDiagnosis.defaultProps = {
    caseAddress: null
};

export default withRouter(SubmitDiagnosis);
