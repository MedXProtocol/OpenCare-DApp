import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCaseDetailsLocationHash } from '../utils/web3-util';
import { downloadJson, getFileUrl } from '../utils/storage-util';

class CaseDetails extends Component {
    constructor(){
        super()

        this.state = {
            firstImageUrl: null,
            secondImageUrl: null,
            details: {}
        };
    }

    async componentDidMount() {
        const caseDetailsHash = await getCaseDetailsLocationHash(this.props.caseAddress);
        const detailsJson = await downloadJson(caseDetailsHash);
        const details = JSON.parse(detailsJson);
        this.setState({
            details: details,
            firstImageUrl: getFileUrl(details.firstImageHash),
            secondImageUrl: getFileUrl(details.secondImageHash),
        });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Case Overview</h2>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-6 text-center">
                            <label>Overview Photo:</label>
                        </div>
                        <div className="col-xs-6 text-center">
                            <label>Close-up Photo:</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6 text-center">
                            <img src={this.state.firstImageUrl} alt="Overview" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-6 text-center">
                            <img src={this.state.secondImageUrl} alt="CloseUp" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-12 top10">
                            <label>How long have you had this problem:</label>
                            <p>{this.state.details.howLong}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it growing, shrinking or staying the same size:</label>
                            <p>{this.state.details.size}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it painful:</label>
                            <p>{this.state.details.painful}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it bleeding:</label>
                            <p>{this.state.details.bleeding}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it itching:</label>
                            <p>{this.state.details.itching}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Any history of skin cancer:</label>
                            <p>{this.state.details.skinCancer}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Are you sexually active:</label>
                            <p>{this.state.details.sexuallyActive}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Age:</label>
                            <p>{this.state.details.age}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Country:</label>
                            <p>{this.state.details.country}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Has it changed in color:</label>
                            <p>{this.state.details.color}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Have you tried any treatments so far:</label>
                            <p>{this.state.details.prevTreatment}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Additional comments:</label>
                            <p>{this.state.details.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CaseDetails.propTypes = {
    caseAddress: PropTypes.string
};

CaseDetails.defaultProps = {
    caseAddress: null
};

export default CaseDetails;