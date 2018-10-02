import React, {
  PureComponent
} from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Modal, Alert } from 'react-bootstrap'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import { ErrorModal } from '~/components/ErrorModal'
import {
  cacheCallValue,
  contractByName,
  cacheCall,
  withSaga
} from '~/saga-genesis'

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const viewed = get(state, 'keyValue.usageRestrictionsViewed')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const AdminSettings = contractByName(state, 'AdminSettings')
  const usageRestrictions = cacheCallValue(state, AdminSettings, 'usageRestrictions')
  return {
    usageRestrictions,
    isDoctor,
    viewed
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchUsageRestrictionsViewed: () => {
      dispatch({ type: 'SET_KEY_VALUE', key: 'usageRestrictionsViewed', value: true })
    }
  }
}

function* usageRestrictionsModalSaga({ address, AdminSettings, DoctorManager }) {
  if (!address || !AdminSettings || !DoctorManager) { return }
  yield cacheCall(AdminSettings, 'usageRestrictions')
  yield cacheCall(DoctorManager, 'isDoctor', address)
}

export const UsageRestrictionsModal = connect(mapStateToProps, mapDispatchToProps)(withSaga(usageRestrictionsModalSaga)(
  function ({ usageRestrictions, isDoctor, viewed, dispatchUsageRestrictionsViewed }) {
    if (viewed) { return null }

    var warning

    if (usageRestrictions === '0') { // locked
      warning =
        <h4>
          OpenCare is not taking any new consultations for the time being. If you would like to join the OpenCare network please <a
            target="_blank"
            href="https://t.me/MedCredits"
            rel="noopener noreferrer"
          >
            <span>
              contact us
            </span>
          </a>.
        </h4>
    } else if (usageRestrictions === '2' && !isDoctor) {
      warning =
        <h4>
          OpenCare is currently supporting physician-to-physician consultations only. If you would like to join the OpenCare network please <a
            target="_blank"
            href="https://t.me/MedCredits"
            rel="noopener noreferrer"
          >
            <span>
              contact us
            </span>
          </a>.
        </h4>
    }

    const show = !!warning && !viewed

    return (
      <ErrorModal
        show={show}
        onHide={dispatchUsageRestrictionsViewed} title='Usage is Restricted'
        bsStyle='warning'>
        {warning}
      </ErrorModal>
    )
  }
))
