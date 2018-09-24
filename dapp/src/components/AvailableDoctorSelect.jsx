import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { LoadingLines } from '~/components/LoadingLines'
import get from 'lodash.get'

export const AvailableDoctorSelect =
  class _AvailableDoctorSelect extends Component {
    static propTypes = {
      doctor: PropTypes.any,
      noDoctorsAvailable: PropTypes.bool,
      searching: PropTypes.bool
    }

    render () {
      let msg

      if (this.props.searching) {
        msg = (
          <span>
            Finding you a Doctor
            <LoadingLines visible={true} color="#cccccc" />
          </span>
        )
      } else if (this.props.noDoctorsAvailable) {
        msg = "No doctors available. Please check back at another time."
      } else if (this.props.doctor) {
        msg = `Your doctor will be ${get(this.props.doctor, 'name')}`
      }

      return (
        <h5>
          {msg}
        </h5>
      )
    }
  }
