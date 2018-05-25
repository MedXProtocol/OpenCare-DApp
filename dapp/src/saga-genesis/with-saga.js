import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

let lastSagaKey = 0

export function withSaga(saga, { propTriggers: propTriggers, storeKey: storeKey } = { storeKey: 'store' }) {
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

    const SagaWrapper = connect(() => { return {} }, mapDispatchToProps)(class extends Component {
      constructor(props, context) {
        super(props, context)
        this.sagaKey = lastSagaKey++
      }

      componentDidMount() {
        this.runSaga(this.props)
      }

      componentWillUnmount() {
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
