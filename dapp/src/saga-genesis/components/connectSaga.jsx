import React, { Component } from 'react'
import { withSaga } from './with-saga'
import { connect } from 'react-redux'

export function connectSaga(saga) {
  return function (WrappedComponent) {
    function mapStateToProps(state, ownProps) {
      return state.sagaGenesis.cacheScope[ownProps.sagaKey]
    }
    return WrappedComponent
    // return withSaga(saga)(
    //   connect(mapStateToProps)(WrappedComponent)
    // )
  }
}
