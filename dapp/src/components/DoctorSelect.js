import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isBlank } from '~/utils/isBlank'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { withSaga, cacheCallValue, cacheCall } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state, ownProps) {
  const DoctorManager = contractByName(state, 'DoctorManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const doctorCount = cacheCallValue(state, DoctorManager, 'doctorCount')
  const doctors = []
  for (var i = 0; i < doctorCount; i++) {
    const address = cacheCallValue(state, DoctorManager, 'doctorAddresses', i)
    doctors.push({
      name: cacheCallValue(state, DoctorManager, 'doctorNames', i),
      address,
      publicKey: cacheCallValue(state, AccountManager, 'publicKeys', address)
    })
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

export const DoctorSelect =
  connect(mapStateToProps)(
    withSaga(saga, { propTriggers: ['doctorCount', 'DoctorManager', 'AccountManager']})(
      class _DoctorSelect extends Component {
        static propTypes = {
          excludeDoctorAddresses: PropTypes.array
        }
        static defaultProps = {
          excludeDoctorAddresses: []
        }
        render () {
          let options = this.props.doctors.map(doctor => ({ label: doctor.name, value: doctor.address, publicKey: doctor.publicKey }))
          options = options.filter(option => {
            return (
              !isBlank(option.publicKey) &&
              this.props.excludeDoctorAddresses.indexOf(option.value) === -1
            )
          })
          return <Select {...this.props} options={options} />
        }
      }
    )
  )
