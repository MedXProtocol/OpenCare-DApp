import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { withRouter, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { getAccount } from '@/services/get-account'
import { isSignedIn, signOut } from '@/services/sign-in'
import redirectService from '@/services/redirect-service'
import { connect } from 'react-redux'

function mapStateToProps (state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  return {
    address,
    account: getAccount(address),
    web3Failed: state.sagaGenesis.web3.error
  }
}

export const SignInRedirect = withRouter(connect(mapStateToProps)(class extends Component {
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
    if (this.props.address && this.props.address !== nextProps.address) {
      signOut()
    }
    this.checkSignInRedirect(nextProps)
  }

  unload = () => {
    if (process.env.NODE_ENV !== 'development') {
      signOut()
    }
  }

  checkSignInRedirect (props) {
    let nextState = {
      redirect: ''
      // requestedPathname: props.location.pathname
    }

    if (props.web3Failed) {
      nextState = {
        redirect: '/try-metamask',
        requestedPathname: props.location.pathname
      }
    } else if (!props.address) {
      nextState = {
        redirect: '/login-metamask',
        requestedPathname: props.location.pathname
      }
    } else {
      let signedIn = isSignedIn()
      let redirectPathname = redirectService({
        isSignedIn: signedIn,
        hasAccount: !!props.account,
        pathname: props.location.pathname
      })
      if (redirectPathname) {
        nextState = {
          redirect: redirectPathname,
          requestedPathname: props.location.pathname
        }
      }
    }
    this.setState(nextState)
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
}))
