import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route, Redirect } from 'react-router-dom'
import { CreateAccount } from './screens/create-account'
import { SignIn } from './screens/sign-in'
import PatientProfile from './screens/Patient Profile'
import NewCase from './screens/New Case'
import PatientCase from './screens/Patient Case'
import DiagnoseCase from './screens/Diagnose Case'
import AddDoctor from './screens/Add Doctor'
import Mint from './screens/Mint'
import Wallet from './screens/Wallet'
import EmergencyKit from './screens/emergency-kit'
import { OpenCases } from './screens/open-cases'
import { SignInRedirectContainer } from './sign-in-redirect'
import { TryMetamask } from './screens/try-metamask'
import { LoginToMetaMask } from './screens/login-to-metamask'
import { connect } from 'react-redux'

const App = class extends Component {
  render () {
    var result =
      <div>
        <SignInRedirectContainer />
        <Route path='/emergency-kit' component={EmergencyKit} />
        <Route path='/login-metamask' component={LoginToMetaMask} />
        <Route path='/try-metamask' component={TryMetamask} />
        <Route path='/sign-in' component={ SignIn } />
        <Route path='/sign-up' component={ CreateAccount } />
        <Route path='/new-case' component={ NewCase }/>
        <Route path='/patient-case/:caseAddress' component={ PatientCase }/>
        <Route path='/diagnose-case/:caseAddress' component={ DiagnoseCase }/>
        <Route path='/doctors' component={ AddDoctor }/>
        <Route path='/mint' component={ Mint }/>
        <Route path='/wallet' component={ Wallet }/>
        <Route path='/cases/open' component={ OpenCases } />
        <Route exact path='/' component={ PatientProfile }/>
      </div>

    return result
  }
}

App.defaultProps = {
  accounts: []
}

export default withRouter(App)
