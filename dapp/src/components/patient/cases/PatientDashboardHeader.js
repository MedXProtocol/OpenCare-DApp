import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  contractByName
} from '~/saga-genesis'
import { usageRestrictionsToString } from '~/utils/usageRestrictionsToString'
import get from 'lodash.get'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFileMedical from '@fortawesome/fontawesome-free-solid/faFileMedical';
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const AdminSettings = contractByName(state, 'AdminSettings')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const usageRestrictionsInt = cacheCallValueInt(state, AdminSettings, 'usageRestrictions')

  return {
    address,
    AdminSettings,
    DoctorManager,
    isDoctor,
    usageRestrictionsInt
  }
}

function* patientDashboardHeaderSaga({ AdminSettings, DoctorManager, address }) {
  if (!AdminSettings || !DoctorManager || !address) { return }

  yield cacheCall(AdminSettings, 'usageRestrictions')
  if (address) {
    yield cacheCall(DoctorManager, 'isDoctor', address)
  }
}

export const PatientDashboardHeader = connect(mapStateToProps)(
  withSaga(patientDashboardHeaderSaga)(
    class _PatientDashboardHeader extends Component {

      createCaseNotPermitted = () => {
        const usageRestrictions = usageRestrictionsToString(this.props.usageRestrictionsInt)
        if (
              usageRestrictions === 'Locked'
          || (usageRestrictions === 'Only Doctors' && !this.props.isDoctor)
        ) {
          return true
        } else {
          return false
        }
      }

      createCaseNotPermittedReason = () => {
        let reasonString
        const usageRestrictions = usageRestrictionsToString(this.props.usageRestrictionsInt)
        if (usageRestrictions === 'Locked') {
          reasonString = 'You are currently not permitted to create<br /> new cases as Hippocrates is locked.'
        } else if (usageRestrictions === 'Only Doctors') {
          reasonString = 'You are currently not permitted to create<br /> new cases unless you are a Doctor.'
        }
        return reasonString
      }

      componentDidUpdate() {
        ReactTooltip.rebuild()
      }

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
                  <br className="visible-xs hidden-sm hidden-md hidden-lg" />

                  <span
                    data-for={'case-creation-not-permitted-tooltip'}
                    data-tip={this.createCaseNotPermitted() ? this.createCaseNotPermittedReason() : null}
                  >
                    <ReactTooltip
                      id='case-creation-not-permitted-tooltip'
                      html={true}
                      effect='solid'
                      place={'bottom'}
                      wrapper='span'
                    />
                    <Link
                      className="btn btn-lg btn-success"
                      to={this.createCaseNotPermitted() ? '#' : routes.PATIENTS_CASES_NEW}
                      disabled={this.createCaseNotPermitted() ? true : false}
                    >
                      <FontAwesomeIcon
                        icon={faFileMedical}
                        size='lg'
                      />
                      &nbsp; Start New Case
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  )
)
