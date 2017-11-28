import React, { Component } from 'react';
import NewCase from './components/NewCase';
import AccountAddress from '../../components/AccountAddress';
import AccountBalance from '../../components/AccountBalance';
import PatinetCases from './components/PatientCases';
import { withRouter } from 'react-router-dom';


class PatientProfile extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <NewCase />
          </div>
          <div className="col-lg-3 col-md-6">
            <AccountBalance />
          </div>
          <div className="col-lg-6 col-md-12">
            <AccountAddress />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <PatinetCases />
          </div>
        </div>
      </div>
      /*<div>
        <h1>Patient view</h1>
        <div>
          <button 
              type="button" 
              className="btn btn-default"
              onClick={() => this.navigateToNewCaseScree()}>
            New Case
            </button>
        </div>
        <div className="list-group">
          {this.renderCases(this.state.cases)}
        </div>
      </div>*/
    );
  }
}

export default withRouter(PatientProfile);
