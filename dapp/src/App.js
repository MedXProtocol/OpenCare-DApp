import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
import { withAccountManager } from './drizzle-helpers/with-account-manager'
import get from 'lodash.get'
import { SignInRedirect } from './sign-in-redirect'

class App extends Component {
  constructor (props, context) {
    super(props)
    this.state = {}
  }

  render () {
    let publicKey
    if (this.props.drizzleInitialized && this.props.accounts[0]) {
      this.publicKeyDataKey = this.props.AccountManager.publicKeys.cacheCall(this.props.accounts[0])
      publicKey = this.props.AccountManager.publicKeys.value(this.isDoctorDataKey)
    }

    return (
      <div>
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

App.defaultProps = {
  accounts: []
}

export default withRouter(withAccountManager(App))
