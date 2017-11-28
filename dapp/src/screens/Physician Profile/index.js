import React, { Component } from 'react';
import AccountAddress from '../../components/AccountAddress';
import AccountBalance from '../../components/AccountBalance';
import GetCase from './components/GetCase';

class PhysicianProfile extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <GetCase />
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
            {/* <PatinetCases /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default PhysicianProfile;
