import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { withRouter, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { getAccount } from '@/services/get-account'
import { isSignedIn, signOut } from '@/services/sign-in'
import redirect from '@/services/redirect'
import { withPropSaga } from '@/components/with-prop-saga'
import { getSelectedAccount } from '@/utils/web3-util'
import { drizzleConnect } from 'drizzle-react'

function mapStateToProps (state, ownProps) {
  return {
    address: get(state, 'accounts[0]')
  }
}

function* propSaga(ownProps) {
  let account = getAccount(ownProps.address)
  return {
    account
  }
}

export const SignInRedirect = withRouter(drizzleConnect(withPropSaga(propSaga, class extends Component {
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
    var state = this.getSignInRedirectState(props)
    if (state) { this.setState(state) }
  }

  getSignInRedirectState = (props) => {
    const { location } = props
    if (!location) { return }
    let signedIn = isSignedIn()
    return redirect({isSignedIn: signedIn, hasAccount: !!props.account, pathname: location.pathname, state: this.state})
  }

  render () {
    if (this.state.redirect && this.props.location.pathname !== this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    } else {
      return <span></span>
    }
  }
}), mapStateToProps))
