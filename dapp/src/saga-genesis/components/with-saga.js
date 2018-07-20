import React, { Component } from 'react'
import { connect } from 'react-redux'

let lastSagaKey = 0

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

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

      displayName = `WithSaga(${getDisplayName(WrappedComponent)})`

      constructor(props, context) {
        super(props, context)
        this.sagaKey = ++lastSagaKey
      }

      componentDidMount() {
        // if (this.displayName === "WithSaga(_OpenCasesContainer)")
        //   console.log("++++++++++++++++++MOUNTING SAGA")
        this.props.dispatchPrepareSaga(this.props, this.sagaKey)
      }

      componentWillUnmount() {
        // if (this.displayName === "WithSaga(_OpenCasesContainer)")
        //   console.log("------------------UNMOUNTING SAGA")
        this.props.dispatchEndSaga(this.sagaKey)
      }

      componentWillReceiveProps (props) {
        // if (this.displayName === "WithSaga(_OpenCasesContainer)")
        //   console.log('withSaga Received Props')

        let propsChanged = false
        if (typeof propTriggers === 'string') {
          propsChanged = this.props[propTriggers] !== props[propTriggers]
        } else if (Array.isArray(propTriggers)) {
          propsChanged = propTriggers.reduce((changed, prop) => {
            // if (this.displayName === "WithSaga(_OpenCasesContainer)")
              // console.log(changed, prop)
            return changed || this.props[prop] !== props[prop]
          }, false)
          // if (this.displayName === "WithSaga(_OpenCasesContainer)")
            // console.log(propsChanged)
        }
        if (propsChanged) {
          // if (this.displayName === "WithSaga(_OpenCasesContainer)")
          //   console.log("props changed!")
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
