import React, { Component } from 'react'
import { sagaMiddleware } from '@/saga-middleware'

export function withPropSaga(saga, WrappedComponent) {
  const PropSagaWrapper = class extends Component {
    constructor (props, context) {
      super(props, context)
      this.state = {
        sagaProps: {}
      }
    }

    componentDidMount() {
      this.runTask(this.props)
    }

    componentWillReceiveProps (props) {
      this.runTask(props)
    }

    runTask (ownProps) {
      this.task = sagaMiddleware.run(saga, ownProps)
      this.task.done.then((props) => {
        this.setState({sagaProps: props})
        this.task = null
      })
    }

    componentWillUnmount () {
      if (this.task) {
        this.task.cancel()
      }
    }

    render () {
      return <WrappedComponent {...this.props} {...this.state.sagaProps} />
    }
  }

  return PropSagaWrapper
}
