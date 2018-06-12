import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route, Redirect, Switch } from 'react-router-dom'
import { CreateAccount } from './screens/create-account'
import { SignIn } from './screens/sign-in'
import PatientProfile from './screens/Patient Profile'
import NewCase from './screens/New Case'
import PatientCase from './screens/Patient Case'
import DiagnoseCase from './screens/Diagnose Case'
import AddDoctor from './screens/Add Doctor'
import Mint from './screens/Mint'
import Wallet from './screens/Wallet'
import { EmergencyKit } from './screens/emergency-kit'
import { OpenCases } from './screens/open-cases'
import { SignInRedirectContainer } from './sign-in-redirect'
import { Welcome } from './components/welcome'
import { TryMetamask } from './screens/try-metamask'
import { LoginToMetaMask } from './screens/login-to-metamask'
import FourOhFour from './screens/four-oh-four'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'

const App = class extends Component {
  render () {
    return (
      <div>
        <SignInRedirectContainer />
        <Switch>
          <Route path='/welcome' component={Welcome} />
          <Route path='/login-metamask' component={LoginToMetaMask} />
          <Route path='/try-metamask' component={TryMetamask} />

          <Route path='/emergency-kit' component={EmergencyKit} />
          <Route path='/sign-in' component={SignIn} />
          <Route path='/sign-up' component={CreateAccount} />
          <Route path='/mint' component={Mint}/>
          <Route path='/wallet' component={Wallet}/>

          <Route path='/doctors/cases/open' component={OpenCases} />
          <Route path='/doctors/cases/diagnose/:caseAddress' component={DiagnoseCase}/>
          <Route path='/doctors/new' component={AddDoctor}/>

          <Route exact path='/patients/cases/new' component={NewCase}/>
          <Route exact path='/patients/cases' component={PatientProfile}/>
          <Route path='/patients/cases/:caseAddress' component={PatientCase}/>

          <Route path='/' component={FourOhFour} />
        </Switch>
      </div>
    )
  }
}

App.defaultProps = {
  accounts: []
}

export default hot(module)(withRouter(App))
