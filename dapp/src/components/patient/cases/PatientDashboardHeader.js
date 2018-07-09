import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFileMedical from '@fortawesome/fontawesome-free-solid/faFileMedical';
import * as routes from '~/config/routes'

export const PatientDashboardHeader = class extends Component {
  render() {
    return (
      <div className="header-card card">
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-8 col-sm-12'>
              <h3 className="title">
                My Cases
              </h3>
              <span className="sm-block text-gray">
                <strong>Current &amp; Historical</strong>
              </span>
            </div>
            <div className='col-md-4 col-sm-12 button-container'>
              <Link className="btn btn-lg btn-success" to={routes.PATIENTS_CASES_NEW}>
                <FontAwesomeIcon
                  icon={faFileMedical}
                  size='lg'
                />
                &nbsp; Start New Case
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
