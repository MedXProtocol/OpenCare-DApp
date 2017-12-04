import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import NewCase from './components/NewCase';
import PatinetCases from './components/PatientCases';

class PatientProfile extends Component {
  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <NewCase />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <PatinetCases />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default PatientProfile;
