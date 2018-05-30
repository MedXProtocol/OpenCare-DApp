import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createCall } from './utils/create-call'

let transactionIds = 1

export function withSend(WrappedComponent) {
  function mapDispatchToProps(dispatch, props) {
    return {
      dispatchSend: (transactionId, call, options) => {
        dispatch({type: 'WEB3_SEND', transactionId, call, options})
      }
    }
  }

  const SendWrapper = connect(() => { return {} }, mapDispatchToProps)(class extends Component {
    send = (address, method, ...args) => {
      return (options) => {
        let call = createCall(address, method, ...args)
        let transactionId = transactionIds++
        this.props.dispatchSend(transactionId, call, options)
        return transactionId
      }
    }

    render () {
      return <WrappedComponent {...this.props} send={this.send} />
    }
  })

  return SendWrapper
}
