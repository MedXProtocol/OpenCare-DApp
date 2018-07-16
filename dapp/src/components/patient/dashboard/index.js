import React, { Component } from 'react'
import { PatientDashboardHeader } from '../cases/PatientDashboardHeader'
import { PatientCasesContainer } from '../cases'
import { PageTitle } from '~/components/PageTitle'

export const PatientDashboard = class _PatientDashboard extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.patientCases')} />
        <div className='container'>
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
      </div>
    )
  }
}
