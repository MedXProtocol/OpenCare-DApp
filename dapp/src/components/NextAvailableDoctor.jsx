import React from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'

function mapStateToProps(state) {
  const noDoctorsAvailable = get(state, 'nextAvailableDoctor.noDoctorsAvailable')
  const searchingForDoctor = get(state, 'nextAvailableDoctor.searching')
  const doctor = get(state, 'nextAvailableDoctor.doctor')

  return {
    noDoctorsAvailable,
    searchingForDoctor,
    doctor
  }
}

export const NextAvailableDoctor = connect(mapStateToProps)(function ({ noDoctorsAvailable, searchingForDoctor, doctor }) {
  return (
    <AvailableDoctorSelect
      doctor={doctor}
      noDoctorsAvailable={noDoctorsAvailable}
      searching={searchingForDoctor} />
  )
})
