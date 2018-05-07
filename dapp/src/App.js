import React, { Component } from 'react'
import { withRouter, Route, Redirect } from 'react-router-dom'
import Home from './screens/Home'
import { CreateAccount } from './screens/create-account'
import { SignIn } from './screens/sign-in'
import PatientProfile from './screens/Patient Profile'
import NewCase from './screens/New Case'
import PatientCase from './screens/Patient Case'
import PhysicianProfile from './screens/Physician Profile'
import DiagnoseCase from './screens/Diagnose Case'
import AddDoctor from './screens/Add Doctor'
import Mint from './screens/Mint'
import Wallet from './screens/Wallet'
import hasAccount from '@/services/has-account'
import './App.css'

import { isSignedIn, signIn, signOut } from '@/services/sign-in'

class App extends Component {
  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("blur", this.unload)
    window.addEventListener("focus", this.refocus)
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("blur", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  unload = () => {
    signOut()
  }

  refocus = () => {
    this.forceUpdate()
  }

  render () {
    const { location } = this.props

    const isAccessScreen = location.pathname == '/sign-up' || location.pathname == '/sign-in'

    if (!isSignedIn()) {
      console.log('you are not signed in')
    }

    var redirect
    if (!isSignedIn() && !hasAccount() && !isAccessScreen) {
      redirect = <Redirect to='/sign-up' />
    } else if (!isSignedIn() && !isAccessScreen) {
      redirect = <Redirect to='/sign-in' />
    }

    return (
      <div>
        {redirect}
        <Route exact path='/sign-in' component={ SignIn } />
        <Route exact path='/sign-up' component={ CreateAccount } />
        <Route exact path='/' component={ Home }/>
        <Route exact path='/new-case' component={ NewCase }/>
        <Route exact path='/patient-case/:caseAddress' component={ PatientCase }/>
        <Route exact path='/patient-profile' component={ PatientProfile }/>
        <Route exact path='/physician-profile' component={ PhysicianProfile }/>
        <Route exact path='/diagnose-case/:caseAddress' component={ DiagnoseCase }/>
        <Route exact path='/doctors' component={ AddDoctor }/>
        <Route exact path='/mint' component={ Mint }/>
        <Route exact path='/wallet' component={ Wallet }/>
      </div>
    )
  }
}

export default withRouter(App)
