import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCaseDoctorBDiagnosisLocationHash } from '../../../utils/web3-util';
import { downloadJson } from '../../../utils/storage-util';

class ChallengedDiagnosis extends Component {
    constructor(props){
        super(props)

        this.state = {
            diagnosis: {},
            hidden: true
        };
    }

    async componentDidMount() {
        const diagnosisHash = await getCaseDoctorBDiagnosisLocationHash(this.props.caseAddress);

        if(diagnosisHash !== null && diagnosisHash !== "0x") {
            const diagnosisJson = await downloadJson(diagnosisHash);
            const diagnosis = JSON.parse(diagnosisJson);
            this.setState({
                diagnosis: diagnosis,
                hidden: false
            });
        }
    }

    render() {
        return this.state.hidden ?
            <div/> :
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Second Opinion</h2>
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
            </div>;
    }
}

ChallengedDiagnosis.propTypes = {
    caseAddress: PropTypes.string
};

ChallengedDiagnosis.defaultProps = {
    caseAddress: null
};

export default ChallengedDiagnosis;
