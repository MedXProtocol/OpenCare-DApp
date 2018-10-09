import React from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'
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
        <p>
          OpenCare is not taking any new consultations for the time being. If you would like to join the OpenCare network please <a
            target="_blank"
            href="https://t.me/MedXProtocol"
            rel="noopener noreferrer"
          >
            <span>
              contact us
            </span>
          </a>.
        </p>
    } else if (usageRestrictions === '2' && !isDoctor) {
      warning =
        <p>
          OpenCare is currently supporting physician-to-physician consultations only. If you would like to join the OpenCare network please <a
            target="_blank"
            href="https://t.me/MedXProtocol"
            rel="noopener noreferrer"
          >
            <span>
              contact us
            </span>
          </a>.
        </p>
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
