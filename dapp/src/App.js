import React, { Component } from 'react'
import { withRouter, Route, Redirect } from 'react-router-dom'
import Home from './screens/Home'
import { CreateAccount } from './screens/create-account'
import { SignIn } from './screens/sign-in'
import PatientProfile from './screens/Patient Profile'
import NewCase from './screens/New Case'
import PatientCase from './screens/Patient Case'
import PhysicianProfile from './screens/doctor-home'
import DiagnoseCase from './screens/Diagnose Case'
import AddDoctor from './screens/Add Doctor'
import Mint from './screens/Mint'
import Wallet from './screens/Wallet'
import hasAccount from '@/services/has-account'
import { OpenCases } from './screens/open-cases'
import './App.css'

import { isSignedIn, signIn, signOut } from '@/services/sign-in'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state = this.getSignInRedirectState(props) || {}
  }

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  unload = () => {
    if (process.env.NODE_ENV !== 'development') {
      signOut()
    }
  }

  refocus = () => {
    this.forceUpdate()
  }

  componentWillReceiveProps (nextProps) {
    this.checkSignInRedirect(nextProps)
  }

  getSignInRedirectState (props) {
    let state = null
    const { location } = this.props
    if (!location) { return }
    const isAccessScreen = location.pathname == '/sign-up' || location.pathname == '/sign-in'
    if (!isSignedIn() && !isAccessScreen) {
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
    } else if (isSignedIn()) {
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

  checkSignInRedirect (props) {
    let state = this.getSignInRedirectState(props)
    if (state) { this.setState(state) }
  }

  render () {
    if (this.state.redirectPathname && this.props.location.pathname !== this.state.redirectPathname) {
      var redirect = <Redirect to={this.state.redirectPathname} />
    }

    return (
      <div>
        {redirect}
        <Route path='/sign-in' component={ SignIn } />
        <Route path='/sign-up' component={ CreateAccount } />
        <Route path='/new-case' component={ NewCase }/>
        <Route path='/patient-case/:caseAddress' component={ PatientCase }/>
        <Route path='/patient-profile' component={ PatientProfile }/>
        <Route path='/physician-profile' component={ PhysicianProfile }/>
        <Route path='/diagnose-case/:caseAddress' component={ DiagnoseCase }/>
        <Route path='/doctors' component={ AddDoctor }/>
        <Route path='/mint' component={ Mint }/>
        <Route path='/wallet' component={ Wallet }/>
        <Route path='/cases/open' component={ OpenCases } />
        <Route exact path='/' component={ Home }/>
      </div>
    )
  }
}

export default withRouter(App)
