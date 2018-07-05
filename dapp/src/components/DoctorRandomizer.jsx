import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withDoctors } from '~/components/withDoctors'
import get from 'lodash.get'

export const DoctorRandomizer =
  withDoctors(
    class _DoctorRandomizer extends Component {
      static propTypes = {
        value: PropTypes.any,
        onChange: PropTypes.func.isRequired
      }

      componentDidMount () {
        this.init(this.props)
      }

      componentWillReceiveProps (nextProps) {
        this.init(nextProps)
      }

      init (props) {
        // if the doctor hasn't been set and if we have all the doctors
        if (!props.value &&
            props.includedDoctors.length > 0 &&
            props.includedDoctors.length + props.excludedDoctors.length === +props.doctorCount) {
          // pick a random one
          const doctorIndex = parseInt(Math.random() * props.includedDoctors.length, 10)
          const doctor = props.includedDoctors[doctorIndex]
          const selectOption = { label: doctor.name, value: doctor.address, publicKey: doctor.publicKey }
          props.onChange(selectOption)
        }
      }

      render () {
        return <p>Your doctor will be {get(this.props.value, 'label')}</p>
      }
    }
  )
