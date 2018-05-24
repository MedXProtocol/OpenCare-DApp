import React, { Component } from 'react'
import getWeb3 from '@/get-web3'
import PropTypes from 'prop-types'
import { sagaCacheContext } from '@/saga-genesis/saga-cache-context'
import { connect } from 'react-redux'
import isEqualWith from 'lodash.isequalwith'

export function withSaga(saga, { propTriggers: propTriggers, storeKey: storeKey } = { propTriggers: [], storeKey: 'store' }) {
  return function (WrappedComponent) {
    let wrappedSaga = sagaCacheContext(saga)

    function mapStateToProps(state) {
      return {
        // running: state.sagas[key]
      }
    }

    function mapDispatchToProps(dispatch, props) {
      return {
        run: (newProps, key) => {
          dispatch({type: 'RUN_SAGA', saga: wrappedSaga, props: newProps, key})
        }
      }
    }

    const SagaWrapper = connect(mapStateToProps, mapDispatchToProps)(class extends Component {
      componentDidMount() {
        this.runSaga(this.props)
      }

      componentWillReceiveProps (props) {
        if (propTriggers.length) {
          var triggerPropsMatch = propTriggers.reduce((matched, prop) => {
            return matched && this.props[prop] === props[prop]
          }, true)
          if (!triggerPropsMatch) {
            this.runSaga(props)
          }
        }
      }

      runSaga = (props) => {
        if (!props.running) {
          props.run(props)
        }
      }

      render () {
        return <WrappedComponent {...this.props} runSaga={this.runSaga} />
      }
    })

    return SagaWrapper
  }
}
