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

      randomOption (doctorArray) {
        const doctorIndex = parseInt(Math.random() * doctorArray.length, 10)
        const doctor = doctorArray[doctorIndex]
        return { label: doctor.name, value: doctor.address, publicKey: doctor.publicKey }
      }

      init (props) {
        // if the doctor hasn't been set and if we have all the doctors
        if (!props.value &&
            props.includedDoctors.length > 0 &&
            props.includedDoctors.length + props.excludedDoctors.length === +props.doctorCount) {

          let selectOption = null
          const onlineDoctors = props.includedDoctors.filter((doctor) => doctor.online)
          if (onlineDoctors.length) {
            selectOption = this.randomOption(onlineDoctors)
          } else {
            selectOption = this.randomOption(props.includedDoctors)
          }

          props.onChange(selectOption)
        }
      }

      render () {
        return <p>Your doctor will be {get(this.props.value, 'label')}</p>
      }
    }
  )
