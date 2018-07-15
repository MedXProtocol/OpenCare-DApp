import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withAvailableDoctor } from '~/components/withAvailableDoctor'
import get from 'lodash.get'

export const AvailableDoctorSelect =
  withAvailableDoctor(
    class _AvailableDoctorSelect extends Component {
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
        const valueHasNotBeenSet = !props.value && props.doctor
        const valueIsDifferentDoctor = props.value && props.doctor && props.value.value !== props.doctor.address
        if (valueHasNotBeenSet || valueIsDifferentDoctor) {
          const option = { label: props.doctor.name, value: props.doctor.address, publicKey: props.doctor.publicKey }
          props.onChange(option)
        }
      }

      render () {
        return this.props.value ? <p>Your doctor will be {get(this.props.value, 'label')}</p> : null
      }
    }
  )
