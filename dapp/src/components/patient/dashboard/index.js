import React, { Component } from 'react';
import { MainLayoutContainer } from '~/layouts/MainLayout';
import { PatientDashboardHeaderContainer } from '../cases/PatientDashboardHeader';
import { PatientCasesContainer } from '../cases';

export const PatientDashboard = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <PatientDashboardHeaderContainer />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <PatientCasesContainer />
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    );
  }
}
