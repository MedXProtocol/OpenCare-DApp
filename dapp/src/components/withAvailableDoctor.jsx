import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'

function mapStateToProps(state, ownProps) {
  return {
    doctor: state.nextAvailableDoctor.doctor,
    initialized: state.nextAvailableDoctor.initialized,
    excludedDoctors: state.nextAvailableDoctor.excludedAddresses
  }
}

function mapDispatchToProps(dispatch) {
  return {
    excludedDoctors: (addresses) => {
      dispatch({ type: 'EXCLUDED_DOCTORS', addresses })
    }
  }
}

export function withAvailableDoctor(WrappedComponent) {
  return (
    connect(mapStateToProps, mapDispatchToProps)(
      class _withDoctors extends Component {
        static propTypes = {
          excludeAddresses: PropTypes.array
        }

        static defaultProps = {
          excludeAddresses: []
        }

        componentWillReceiveProps (props) {
          if (props.initialized &&
              props.excludeAddresses.length &&
              !isEqual(props.excludeAddresses, props.excludedDoctors)) {
            this.props.excludedDoctors(props.excludeAddresses)
          }
        }

        render () {
          return <WrappedComponent {...this.props} doctor={this.props.doctor} />
        }
      }
    )
  )
}
