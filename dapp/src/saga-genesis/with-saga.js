import React, { Component } from 'react'
import getWeb3 from '@/get-web3'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqualWith from 'lodash.isequalwith'

let lastSagaKey = 0

export function withSaga(saga, { propTriggers: propTriggers, storeKey: storeKey } = { storeKey: 'store' }) {
  return function (WrappedComponent) {
    function mapStateToProps(state) {
      return {
        // running: state.sagas[key]
      }
    }

    function mapDispatchToProps(dispatch, props) {
      return {
        run: (newProps, key) => {
          dispatch({type: 'RUN_SAGA', saga, props: newProps, key})
        }
      }
    }

    const SagaWrapper = connect(mapStateToProps, mapDispatchToProps)(class extends Component {
      constructor(props, context) {
        super(props, context)
        this.sagaKey = lastSagaKey++
      }

      componentDidMount() {
        this.runSaga(this.props)
      }

      componentWillReceiveProps (props) {
        let propsChanged = false
        if (typeof propTriggers === 'string') {
          propsChanged = this.props[propTriggers] !== props[propTriggers]
        } else if (Array.isArray(propTriggers)) {
          propsChanged = propTriggers.reduce((changed, prop) => {
            return changed || this.props[prop] !== props[prop]
          }, false)
        }
        if (propsChanged) {
          this.runSaga(props, this.sagaKey)
        }
      }

      runSaga = (props) => {
        if (!props.running) {
          props.run(props, this.sagaKey)
        }
      }

      render () {
        return <WrappedComponent {...this.props} runSaga={this.runSaga} />
      }
    })

    return SagaWrapper
  }
}
