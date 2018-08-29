import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { connect } from 'react-redux'
import { isBlank } from '~/utils/isBlank'
import PropTypes from 'prop-types'
import { withSaga, cacheCallValue, cacheCall, contractByName } from '~/saga-genesis'
import get from 'lodash.get'
import range from 'lodash.range'

function mapStateToProps(state, ownProps) {
  const DoctorManager = contractByName(state, 'DoctorManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const doctorCount = cacheCallValue(state, DoctorManager, 'doctorCount')
  const doctors = []

  // doctorCount at 0 is empty records because Solidity, start at 1
  for (var i = 1; i < doctorCount; i++) {
    const address = cacheCallValue(state, DoctorManager, 'doctorAddresses', i)
    if (address) {
      doctors.push({
        doctorIndex: i,
        country: cacheCallValue(state, DoctorManager, 'doctorCountries', i),
        region: cacheCallValue(state, DoctorManager, 'doctorRegions', i),
        name: cacheCallValue(state, DoctorManager, 'doctorNames', i),
        address,
        isActive: cacheCallValue(state, DoctorManager, 'isActive', address),
        publicKey: cacheCallValue(state, AccountManager, 'publicKeys', address),
        online: get(state, `heartbeat[${address.toLowerCase()}].online`, false)
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

  // doctorCount at 0 is empty records because Solidity, start at 1
  const indices = range(1, doctorCount)

  yield all(
    indices.map(function* (i) {
      const address = yield cacheCall(DoctorManager, 'doctorAddresses', i)
      yield all([
        cacheCall(DoctorManager, 'doctorCountries', i),
        cacheCall(DoctorManager, 'doctorRegions', i),
        cacheCall(DoctorManager, 'doctorNames', i),
        cacheCall(DoctorManager, 'isActive', address),
        cacheCall(AccountManager, 'publicKeys', address)
      ])
    })
  )
}

export function withDoctors(WrappedComponent) {
  return (
    connect(mapStateToProps)(
      withSaga(saga)(
        class _withDoctors extends Component {
          static propTypes = {
            excludeAddresses: PropTypes.array
          }
          render () {
            const includedDoctors = []
            const excludedDoctors = []
            this.props.doctors.forEach(doctor => {
              if (
                doctor.isActive &&
                !isBlank(doctor.publicKey) &&
                this.props.excludeAddresses.indexOf(doctor.address) === -1
              ) {
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
