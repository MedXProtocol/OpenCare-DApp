import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { withRouter, Redirect } from 'react-router-dom'

import hasAccount from '@/services/has-account'
import { isSignedIn, signOut } from '@/services/sign-in'
import redirect from '@/services/redirect'

export const SignInRedirect = withRouter(class extends Component {
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
      signOut()
    }
  }

  checkSignInRedirect (props) {
    var state = this.getSignInRedirectState(props)
    if (state) { this.setState(state) }
  }

  getSignInRedirectState = (props) => {
    const { location } = props
    if (!location) { return }
    let signedIn = isSignedIn()
    return redirect({isSignedIn: signedIn, hasAccount: hasAccount(), pathname: location.pathname, state: this.state})
  }

  render () {
    if (this.state.redirect && this.props.location.pathname !== this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    } else {
      return <span></span>
    }
  }
})
