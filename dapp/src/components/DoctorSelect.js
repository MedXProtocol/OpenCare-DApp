import React, { Component } from 'react'
import Select from 'react-select'
import { withDoctors } from '~/components/withDoctors'

export const DoctorSelect =
  withDoctors(
    class _DoctorSelect extends Component {
      render () {
        let options = this.props.includedDoctors.map(doctor => ({ label: doctor.name, value: doctor.address, publicKey: doctor.publicKey }))
        return <Select {...this.props} options={options} />
      }
    }
  )
