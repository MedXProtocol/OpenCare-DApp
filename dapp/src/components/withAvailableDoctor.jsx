import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

function mapStateToProps(state, ownProps) {
  return {
    noDoctorsAvailable: state.nextAvailableDoctor.noDoctorsAvailable,
    doctor: state.nextAvailableDoctor.doctor,
    currentlyExcludedDoctors: state.nextAvailableDoctor.excludedAddresses
  }
}

export function withAvailableDoctor(WrappedComponent) {
  return (
    connect(mapStateToProps)(
      class _withDoctors extends Component {
        static propTypes = {
          excludeAddresses: PropTypes.array
        }

        static defaultProps = {
          excludeAddresses: []
        }

        render () {
          return <WrappedComponent {...this.props} doctor={this.props.doctor} />
        }
      }
    )
  )
}
