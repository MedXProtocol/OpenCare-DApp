import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { withRouter, Redirect } from 'react-router-dom'

import hasAccount from '@/services/has-account'
import { isSignedIn, signOut } from '@/services/sign-in'

export const SignInRedirect = withRouter(class extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.checkSignInRedirect(props)
  }

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
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
      signOut()
    }
  }

  checkSignInRedirect (props) {
    this.getSignInRedirectState(props).then((state) => {
      if (state) { this.setState(state) }
    })
  }

  getSignInRedirectState = async (props) => {
    let state = null
    const { location } = this.props
    if (!location) { return }
    let signedIn = isSignedIn(props.publicKey)
    const isAccessScreen = location.pathname === '/sign-up' || location.pathname === '/sign-in'
    if (!signedIn && !isAccessScreen) {
      let redirect
      if (!hasAccount()) {
        redirect = '/sign-up'
      } else {
        redirect = '/sign-in'
      }
      state = {
        redirectPathname: redirect,
        requestedPathname: location.pathname
      }
    } else if (signedIn) {
      if (this.state.requestedPathname) {
        state = {
          redirectPathname: this.state.requestedPathname,
          requestedPathname: ''
        }
      } else {
        state = {
          redirectPathname: ''
        }
      }
    }
    return state
  }

  render () {
    let redirect
    if (this.state.redirectPathname && this.props.location.pathname !== this.state.redirectPathname) {
      redirect = <Redirect to={this.state.redirectPathname} />
    } else {
      redirect = <span></span>
    }
    return redirect
  }
})

SignInRedirect.propTypes = {
  publicKey: PropTypes.string
}
