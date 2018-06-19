import React, { Component } from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import { SignUpContainer } from './sign-up'
import { SignInContainer } from './sign-in'
import { PatientDashboard } from './patient/dashboard/'
import { NewCase } from './patient/cases/NewCase'
import { PatientCaseContainer } from './patient/cases/PatientCase'
import { DiagnoseCaseContainer } from './patient/cases/diagnose'
import { AddDoctor } from './doctors/new'
import { Mint } from './account/mint'
import { WalletContainer } from './account/wallet'
import { EmergencyKit } from './account/emergency-kit'
import { ChangePasswordContainer } from './account/change-password'
import { OpenCasesContainer } from './open-cases'
import { SignInRedirectContainer } from './sign-in-redirect'
import { Welcome } from '~/components/welcome'
import { TryMetamask } from './try-metamask'
import { LoginToMetaMask } from './login-to-metamask'
import { FourOhFour } from './four-oh-four'
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

          <Route path='/account/emergency-kit' component={EmergencyKit} />
          <Route path='/account/change-password' component={ChangePasswordContainer} />
          <Route path='/account/mint' component={Mint} />
          <Route path='/account/wallet' component={WalletContainer} />

          <Route path='/sign-in' component={SignInContainer} />
          <Route path='/sign-up' component={SignUpContainer} />

          <Route path='/doctors/cases/open' component={OpenCasesContainer} />
          <Route path='/doctors/cases/diagnose/:caseAddress' component={DiagnoseCaseContainer} />
          <Route path='/doctors/new' component={AddDoctor} />

          <Route exact path='/patients/cases/new' component={NewCase} />
          <Route exact path='/patients/cases' component={PatientDashboard} />
          <Route path='/patients/cases/:caseAddress' component={PatientCaseContainer} />

          <Route path='/' component={FourOhFour} />
        </Switch>
        <ReduxToastr
          timeOut={7000}
          newestOnTop={true}
          tapToDismiss={false}
          position="bottom-left"
          transitionIn="bounceIn"
          transitionOut="bounceOut" />
      </div>
    )
  }
}

App.defaultProps = {
  accounts: []
}

export default hot(module)(withRouter(App))
