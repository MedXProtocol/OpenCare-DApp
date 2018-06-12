import React, { Component } from 'react'
import { connect } from 'react-redux'

let lastSagaKey = 0

export function withSaga(saga, { propTriggers, storeKey } = { storeKey: 'store' }) {
  return function (WrappedComponent) {
    function mapDispatchToProps(dispatch, props) {
      return {
        run: (newProps, key) => {
          dispatch({type: 'RUN_SAGA', saga, props: newProps, key})
        },
        clearCalls: (key) => {
          dispatch({type: 'CACHE_DEREGISTER_KEY', key})
        }
      }
    }

    const SagaWrapper = connect(() => { return {} }, mapDispatchToProps)(class _SagaWrapper extends Component {
      constructor(props, context) {
        super(props, context)
        this.sagaKey = lastSagaKey++
      }

      componentDidMount() {
        // console.log('+++Mounting ', WrappedComponent.name)
        this.runSaga(this.props)
      }

      componentWillUnmount() {
        // console.log('---Unmounting ', WrappedComponent.name)
        this.props.clearCalls(this.sagaKey)
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
        props.run(props, this.sagaKey)
      }

      render () {
        return <WrappedComponent {...this.props} />
      }
    })

    return SagaWrapper
  }
}
