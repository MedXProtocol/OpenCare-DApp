import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import { connect } from 'react-redux'
import * as routes from '~/config/routes'
import PropTypes from 'prop-types'
import { Web3Route } from '~/components/Web3Route'
import { setRequestedPathname } from '~/services/setRequestedPathname'

function mapStateToProps (state, ownProps) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const signedIn = get(state, 'account.signedIn')
  return {
    signedIn,
    hasAccount: !!Account.get(address)
  }
}

export const SignedInRoute = connect(mapStateToProps)(class _SignedInRoute extends Component {
  static propTypes = {
    signedIn: PropTypes.bool,
    hasAccount: PropTypes.bool
  }

  redirect () {
    if (!this.props.signedIn && this.props.hasAccount) {
      var redirect = routes.SIGN_IN
    } else if (!this.props.signedIn && !this.props.hasAccount) {
      redirect = routes.WELCOME
    }
    return redirect
  }

  render () {
    const redirect = this.redirect()
    if (redirect) {
      var component = <Redirect to={redirect} />
      setRequestedPathname(this.props.location.pathname)
    } else {
      component = (
        <Web3Route {...this.props} />
      )
    }

    return component
  }
})
