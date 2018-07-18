import React, { Component } from 'react'
import { connect } from 'react-redux'

let lastSagaKey = 0

export function withSaga(saga, { propTriggers, storeKey } = { storeKey: 'store' }) {
  return function (WrappedComponent) {
    function mapDispatchToProps(dispatch, props) {
      return {
        dispatchPrepareSaga: (props, key) => {
          dispatch({ type: 'PREPARE_SAGA', saga, key, props })
        },

        dispatchRunSaga: (props, key) => {
          dispatch({ type: `RUN_SAGA_${key}`, saga, props, key })
        },

        dispatchEndSaga: (key) => {
          dispatch({ type: `END_SAGA_${key}` })
        }
      }
    }

    const SagaWrapper = connect(() => { return {} }, mapDispatchToProps)(class _SagaWrapper extends Component {
      constructor(props, context) {
        super(props, context)
        this.sagaKey = ++lastSagaKey
      }

      componentDidMount() {
        this.props.dispatchPrepareSaga(this.props, this.sagaKey)
      }

      componentWillUnmount() {
        this.props.dispatchEndSaga(this.sagaKey)
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
          this.props.dispatchRunSaga(props, this.sagaKey)
        }
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    })

    return SagaWrapper
  }
}
