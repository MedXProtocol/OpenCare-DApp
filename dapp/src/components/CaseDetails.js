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
                        <div className="col-xs-6">
                            <label>Overview Photo:</label>
                        </div>
                        <div className="col-xs-6">
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
                    </div>
                    <div className="row">
                        <div className="col-xs-12 top10">
                            <label>How long have you had this?</label>
                            <p>{this.state.details.howLong}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 top10">
                            <label>Age</label>
                            <p>{this.state.details.age}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 top10">
                            <label>Sex</label>
                            <p>{this.state.details.sex}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 top10">
                            <label>City</label>
                            <p>{this.state.details.city}</p>
                        </div>
                        <div className="col-lg-6 col-md-12 top10">
                            <label>Country</label>
                            <p>{this.state.details.country}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Description</label>
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