import React, { Component } from 'react';
import {Modal} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Spinner from '../../../components/Spinner';
import {getSelectedAccountBalance, createCase} from '../../../utils/web3-util';
import {uploadJson, uploadFile} from '../../../utils/storage-util';


class CreateCase extends Component {
    constructor(){
        super()

        this.state = {
            firstImageHash: null,
            firstFileName: null,
            secondImageHash: null,
            secondFileName: null,
            howLong: null,
            age: null,
            sex: null,
            city: null,
            country: null,
            description: null,

            submitInProgress: false,
            showBalanceTooLowModal: false,
            showConfirmSubmissionModal: false,
            showThankYouModal: false
        };
    }

    captureFirstImage = async (event) => {
        this.setState({firstFileName: event.target.files[0].name});
        const imageHash = await this.captureFile(event);
        this.setState({firstImageHash: imageHash});
    }

    captureSecondImage = async (event) => {
        this.setState({secondFileName: event.target.files[0].name});
        const imageHash = await this.captureFile(event);
        this.setState({secondImageHash: imageHash});
    }

    captureFile = async (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        const imageHash = await uploadFile(file);
        return imageHash;
    }

    updateHowLong = (event) => {
        this.setState({howLong: event.target.value});
    }

    updateAge = (event) => {
        this.setState({age: event.target.value});
    }

    updateSex = (event) => {
        this.setState({sex: event.target.value});
    }

    updateCity = (event) => {
        this.setState({city: event.target.value});
    }

    updateCountry = (event) => {
        this.setState({country: event.target.value});
    }

    updateDescription = (event) => {
        this.setState({description: event.target.value});
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        
        const accountBalance = await getSelectedAccountBalance();

        if(accountBalance.toNumber() < 150) {
            this.setState({showBalanceTooLowModal: true});
        } else {
            this.setState({showConfirmSubmissionModal: true});
        }
    }

    handleCloseBalanceTooLowModal = (event) => {
        event.preventDefault();
        
        this.setState({showBalanceTooLowModal: false});
    }

    handleCloseThankYouModal = (event) => {
        event.preventDefault();
        
        this.setState({showThankYouModal: false});

        this.props.history.push('/patient-profile');
    }

    handleCancelConfirmSubmissionModal = (event) => {
        event.preventDefault();
        this.setState({showConfirmSubmissionModal: false});
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
        event.preventDefault();
        
        this.setState({showConfirmSubmissionModal: false});
        await this.createNewCase();
    }

    createNewCase = async () => {
        this.setState({submitInProgress: true});

        const caseInformation = {
            firstImageHash: this.state.firstImageHash,
            secondImageHash: this.state.secondImageHash,
            howLong: this.state.howLong,
            age: this.state.age,
            sex: this.state.sex,
            city: this.state.city,
            country: this.state.country,
            description: this.state.description
        };

        const caseJson = JSON.stringify(caseInformation);

        const hash = await uploadJson(caseJson);

        createCase(hash, (error, result) => {
            if(error !== null) {
                this.onError(error);
            } else {
                this.onSuccess();
            }
        });
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
                <form method="#" action="#">
                    <div className="card-header">
                        <h2 className="card-title">
                            New Case
                        </h2>
                        <p className="category">Fill out all of the fields and submit the form</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label>First Image</label>
                            <div>
                                <label className="btn btn-primary">
                                    Browse...<input onChange={this.captureFirstImage} type="file" className="form-control" style={{display: 'none'}} required/>
                                </label>
                                <span>
                                    {this.state.firstFileName}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Second Image</label>
                            <div>
                                <label className="btn btn-primary">
                                    Browse...<input onChange={this.captureSecondImage} type="file" className="form-control" style={{display: 'none'}} required/>
                                </label>
                                <span>
                                    {this.state.secondFileName}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>How long have you had this?</label>
                            <input onChange={this.updateHowLong} type="text" className="form-control" required />
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-lg-6 col-md-12">
                                    <label>Age</label>
                                    <input onChange={this.updateAge} type="text" className="form-control" required />
                                </div>
                                <div className="col-lg-6 col-md-12">
                                    <label className="control-label">Sex</label>
                                    <div>
                                        <div className="radio radio-inline">
                                            <input onChange={this.updateSex} name="sex" id="male" type="radio" value="Male" required />
                                            <label htmlFor="radio">
                                                Male
                                            </label>
                                        </div>
                                        <div className="radio radio-inline">
                                            <input onChange={this.updateSex} name="sex" id="female" type="radio" value="Female" required />
                                            <label htmlFor="female">
                                                Female
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-lg-6 col-md-12">
                                    <label>City</label>
                                    <input onChange={this.updateCity} type="text" className="form-control" required />
                                </div>
                                <div className="col-lg-6 col-md-12">
                                    <label>Country</label>
                                    <input onChange={this.updateCountry} type="text" className="form-control" required />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea onChange={this.updateDescription} className="form-control" rows="5" required />
                        </div>
                        <button onClick={this.handleSubmit} type="submit" className="btn btn-fill btn-primary">Submit</button>
                    </div>
                </form>
                <Modal show={this.state.showBalanceTooLowModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>You need 150 MEDX to submit case.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseBalanceTooLowModal} type="button" className="btn btn-defult">Close</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showConfirmSubmissionModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Are you sure? This will cost 100-150 MEDX.</h4>
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
                                <h4>Thank you! Your case submitted successfully.</h4>
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

export default withRouter(CreateCase);
