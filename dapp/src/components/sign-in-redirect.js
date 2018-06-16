import React, {
  Component
} from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import redirectService from '~/services/redirect-service'
import { connect } from 'react-redux'

function mapStateToProps (state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  let signedIn = get(state, 'account.signedIn')
  return {
    address,
    signedIn,
    account: Account.get(address),
    web3Failed: state.sagaGenesis.web3.error
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

export const SignInRedirect = class extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
    this.checkSignInRedirect(this.props)
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  componentWillReceiveProps (nextProps) {
    this.checkSignInRedirect(nextProps)
  }

  unload = () => {
    if (process.env.NODE_ENV !== 'development') {
      this.props.signOut()
    }
  }

  checkSignInRedirect (nextProps) {
    if (this.props.address && this.props.address !== nextProps.address) {
      this.props.signOut()
    } else {
      let nextState = {
        redirect: ''
      }
      let welcome = (
        nextProps.location.pathname === '/welcome'
        || nextProps.location.pathname === '/'
      )

      if (nextProps.web3Failed && !welcome) {
        nextState = {
          redirect: '/try-metamask',
          requestedPathname: nextProps.location.pathname
        }
      } else if (!nextProps.address && !welcome) {
        nextState = {
          redirect: '/login-metamask',
          requestedPathname: nextProps.location.pathname
        }
      } else {
        let redirectPathname = redirectService({
          isSignedIn: nextProps.signedIn,
          hasAccount: !!nextProps.account,
          pathname: nextProps.location.pathname
        })

        if (redirectPathname) {
          nextState = {
            redirect: redirectPathname,
            requestedPathname: nextProps.location.pathname
          }
        }
      }

      this.setState(nextState)
    }
  }

  render () {
    let redirectComponent = <span></span>

    if (
      this.state.redirect
      && this.props.location.pathname !== this.state.redirect
    )
      redirectComponent = <Redirect to={this.state.redirect} />

    return redirectComponent
  }
}

export const SignInRedirectContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(SignInRedirect))
