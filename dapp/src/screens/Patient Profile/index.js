import React, { Component } from 'react';
import NewCase from './components/NewCase';
import AccountAddress from '../../components/AccountAddress';
import AccountBalance from '../../components/AccountBalance';
import PatinetCases from './components/PatientCases';
import { withRouter } from 'react-router-dom';


class PatientProfile extends Component {
  constructor() {
    super()

    this.state = {
      cases: []
    };
  }

  // async componentDidMount() {
  //   const cases = await getAllCasesForCurrentAccount();
  //   this.setState({cases: cases});
  // }
  
  // navigateToNewCaseScree = () => {
  //   this.props.history.push('/new-case');
  // }
  
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

  renderCases (cases) {
    return cases.map(c => 
      <div key={c.address} className="list-group-item">
        <span>{c.caseDetailLocationHash}</span>,
        <span>{c.text}</span>,
        <span>{c.status.toNumber()}</span>
      </div>
    );
  }
}

export default withRouter(PatientProfile);
