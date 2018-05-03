import React, { Component } from 'react'
import { withRouter, Route, Redirect } from 'react-router-dom'
import Home from './screens/Home'
import { CreateAccount } from './screens/create-account'
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
    window.addEventListener("beforeunload", this.onUnload)
    window.addEventListener("onblur", this.onUnload)
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.onUnload)
    window.removeEventListener("onblur", this.onUnload)
  }

  unload = () => {
    signOut()
  }

  render () {
    const { location } = this.props

    var redirect
    if (location.pathname !== '/sign-up' && !isSignedIn()) {
      redirect = <Redirect to='/sign-up' />
    }

    return (
      <div>
        {redirect}
        <Route exact path='/sign-in' component={ CreateAccount } />
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
