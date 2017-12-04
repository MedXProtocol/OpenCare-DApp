import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import CaseDetails from '../../components/CaseDetails';
import SubmitDiagnosis from './components/SubmitDiagnosis';

class DiagnoseCase extends Component {
  
  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col">
              <CaseDetails caseAddress={this.props.match.params.caseAddress}/>
            </div>
            <div className="col">
              <SubmitDiagnosis caseAddress={this.props.match.params.caseAddress}/>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default DiagnoseCase;
