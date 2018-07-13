import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { PatientDashboardHeader } from '../cases/PatientDashboardHeader'
import { PatientCasesContainer } from '../cases'
import { PageTitle } from '~/components/PageTitle'

export const PatientDashboard = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.patientCases')} />
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <PatientDashboardHeader />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <PatientCasesContainer />
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    )
  }
}
