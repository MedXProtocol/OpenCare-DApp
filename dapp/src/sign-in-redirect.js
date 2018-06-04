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
  let signedIn = isSignedIn()
  return {
    address,
    signedIn,
    account: getAccount(address),
    web3Failed: state.sagaGenesis.web3.error
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
    if (this.props.address && this.props.address !== nextProps.address) {
      signOut()
    }

    // When they've signed in properly and have a specific requested pathname
    if (nextProps.signedIn && this.state.requestedPathname) {
      this.setState({
        redirect: this.state.requestedPathname,
        requestedPathname: ''
      })
    } else {
      this.checkSignInRedirect(nextProps)
    }
  }

  unload = () => {
    if (process.env.NODE_ENV !== 'development') {
      signOut()
    }
  }

  checkSignInRedirect (props) {
    let nextState = {
      redirect: ''
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
      let redirectPathname = redirectService({
        isSignedIn: props.signedIn,
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

    // if (!nextState.redirect && this.state.requestedPathname) {
    //   nextState = {
    //     redirect: this.state.requestedPathname
    //   }
    // } else if (nextState.redirect === this.state.requestedPathname) {
    //   nextState = {
    //     redirect: '',
    //     requestedPathname: ''
    //   }
    // }

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
}

export const SignInRedirectContainer = withRouter(connect(mapStateToProps)(SignInRedirect))
