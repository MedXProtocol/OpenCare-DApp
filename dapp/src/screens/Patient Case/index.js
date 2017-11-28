import React, { Component } from 'react';
import CaseStatus from './components/CaseStatus';
import CaseDetails from '../../components/CaseDetails';
import Diagnosis from './components/Diagnosis';
import ChallengedDiagnosis from './components/ChallengedDiagnosis';

class PatientCase extends Component {
  
  
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <CaseStatus caseAddress={this.props.match.params.caseAddress}/>
          </div>
          <div className="col">
            <CaseDetails caseAddress={this.props.match.params.caseAddress}/>
          </div>
          <div className="col">
            <Diagnosis caseAddress={this.props.match.params.caseAddress}/>
          </div>
          <div className="col">
            <ChallengedDiagnosis caseAddress={this.props.match.params.caseAddress}/>
          </div>
        </div>
      </div>
    );
  }
}

export default PatientCase;
