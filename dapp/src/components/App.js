import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route, Redirect, Switch } from 'react-router-dom'
import { CreateAccount } from './create-account'
import { SignIn } from './sign-in'
import { PatientDashboard } from './patient/dashboard/'
import { NewCase } from './New Case'
import PatientCase from './Patient Case'
import DiagnoseCase from './Diagnose Case'
import AddDoctor from './doctors/new'
import Mint from './Mint'
import Wallet from './Wallet'
import { EmergencyKit } from './emergency-kit'
import { OpenCasesContainer } from './open-cases'
import { SignInRedirectContainer } from './sign-in-redirect'
import { Welcome } from '~/components/welcome'
import { TryMetamask } from './try-metamask'
import { LoginToMetaMask } from './login-to-metamask'
import { FourOhFour } from './four-oh-four'
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

          <Route path='/doctors/cases/open' component={OpenCasesContainer} />
          <Route path='/doctors/cases/diagnose/:caseAddress' component={DiagnoseCase}/>
          <Route path='/doctors/new' component={AddDoctor}/>

          <Route exact path='/patients/cases/new' component={NewCase}/>
          <Route exact path='/patients/cases' component={PatientDashboard} />
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
