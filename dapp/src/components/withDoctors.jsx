import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isBlank } from '~/utils/isBlank'
import PropTypes from 'prop-types'
import { withSaga, cacheCallValue, cacheCall } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state, ownProps) {
  const DoctorManager = contractByName(state, 'DoctorManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const doctorCount = cacheCallValue(state, DoctorManager, 'doctorCount')
  const doctors = []
  for (var i = 0; i < doctorCount; i++) {
    const address = cacheCallValue(state, DoctorManager, 'doctorAddresses', i)
    if (address) {
      doctors.push({
        name: cacheCallValue(state, DoctorManager, 'doctorNames', i),
        address,
        publicKey: cacheCallValue(state, AccountManager, 'publicKeys', address)
      })
    }
  }
  return {
    AccountManager,
    DoctorManager,
    doctorCount,
    doctors
  }
}

function* saga({ DoctorManager, AccountManager }) {
  if (!DoctorManager || !AccountManager) { return }
  const doctorCount = yield cacheCall(DoctorManager, 'doctorCount')
  for (var i = 0; i < doctorCount; i++) {
    const address = yield cacheCall(DoctorManager, 'doctorAddresses', i)
    yield cacheCall(DoctorManager, 'doctorNames', i)
    yield cacheCall(AccountManager, 'publicKeys', address)
  }
}

export function withDoctors(WrappedComponent) {
  return (
    connect(mapStateToProps)(
      withSaga(saga, { propTriggers: ['doctorCount', 'DoctorManager', 'AccountManager'] })(
        class _withDoctors extends Component {
          static propTypes = {
            excludeAddresses: PropTypes.array
          }
          render () {
            const includedDoctors = []
            const excludedDoctors = []
            this.props.doctors.forEach(doctor => {
              if (!isBlank(doctor.publicKey) &&
                  this.props.excludeAddresses.indexOf(doctor.address) === -1) {
                includedDoctors.push(doctor)
              } else {
                excludedDoctors.push(doctor)
              }
            })
            return <WrappedComponent {...this.props} includedDoctors={includedDoctors} excludedDoctors={excludedDoctors} />
          }
        }
      )
    )
  )
}
