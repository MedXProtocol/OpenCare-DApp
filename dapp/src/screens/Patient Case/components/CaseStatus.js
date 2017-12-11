import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCaseStatus } from '../../../utils/web3-util';

class CaseStatus extends Component {
    constructor(){
        super()

        this.state = {
            status: {}
        };
    }

    async componentDidMount() {
        const status = await getCaseStatus(this.props.caseAddress);

        this.setState({status: status});
    }

    render() {
        return ( 
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Status</h2>
                </div>
                <div className="card-content">
                    {
                        this.state.status.code ===  1 ?
                        <div className="alert alert-info">
                            Your case is pending review by a doctor
                        </div> 
                        : this.state.status.code === 2 ?
                        <div className="alert alert-info">
                            Your case has been evaluated. Please review your diagnosis and medical recommendation.
                        </div>
                        : this.state.status.code === 3 ?
                        <div className="alert alert-success">
                            Your case was diagnosed and diagnosis accepted.
                        </div>
                        : this.state.status.code === 4 ?
                        <div className="alert alert-warning">
                            You challenged the case. The case is under review by another doctor.
                        </div>
                        : this.state.status.code === 5 ?
                        <div className="alert alert-danger">
                            You challenged the case. The case is under review by another doctor.
                        </div>
                        : this.state.status.code === 6 ?
                        <div className="alert alert-success">
                            You have received two different diagnoses from separate doctors. Please review both diagnoses and recommendations below. You have been refunded 10 MEDX and may consider re-submitting your case to the network or visiting your local dermatologist.
                        </div>
                        : this.state.status.code === 7 ?
                        <div className="alert alert-danger">
                            You have received the same diagnosis from separate doctors. Please review both recommendations below. A total of 15 MEDX was charged for your first opinion and discounted second opinion.
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    }
}

CaseStatus.propTypes = {
    caseAddress: PropTypes.string
};

CaseStatus.defaultProps = {
    caseAddress: null
};

export default CaseStatus;