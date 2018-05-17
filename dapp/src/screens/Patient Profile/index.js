import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import NewCase from './components/NewCase';
import PatientCases from './components/patient-cases';

class PatientProfile extends Component {
  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <NewCase />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <PatientCases />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default PatientProfile;
