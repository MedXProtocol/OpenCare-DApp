import React, {
  Component
} from 'react'
import { Route, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import { connect } from 'react-redux'
import { setRequestedPathname } from '~/services/setRequestedPathname'
import * as routes from '~/config/routes'
import PropTypes from 'prop-types'

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

  render () {
    const Component = this.props.component
    const otherProps = {
      ...this.props,
      component: undefined
    }

    let redirect = null

    if (!this.props.signedIn && this.props.hasAccount) {
      redirect = routes.SIGN_IN
    } else if (!this.props.signedIn && !this.props.hasAccount) {
      redirect = routes.WELCOME
    }

    if (redirect) {
      var component = <Redirect to={redirect} />
      setRequestedPathname(this.props.location.pathname)
    } else {
      component = (
        <Route {...otherProps} render={props => <Component {...props} />} />
      )
    }

    return component
  }
})
