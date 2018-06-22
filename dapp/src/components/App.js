import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import { hot } from 'react-hot-loader'
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
import * as routes from '~/config/routes'

const App = class _App extends Component {
  render () {
    return (
      <div>
        <SignInRedirectContainer />
        <Switch>
          <Route path={routes.WELCOME} component={Welcome} />
          <Route path={routes.LOGIN_METAMASK} component={LoginToMetaMask} />
          <Route path={routes.TRY_METAMASK} component={TryMetamask} />

          <Route path={routes.ACCOUNT_EMERGENCY_KIT} component={EmergencyKit} />
          <Route path={routes.ACCOUNT_CHANGE_PASSWORD} component={ChangePasswordContainer} />
          <Route path={routes.ACCOUNT_MINT} component={Mint} />
          <Route path={routes.ACCOUNT_WALLET} component={WalletContainer} />

          <Route path={routes.SIGN_IN} component={SignInContainer} />
          <Route path={routes.SIGN_UP} component={SignUpContainer} />

          <Route path={routes.DOCTORS_CASES_OPEN} component={OpenCasesContainer} />
          <Route path={routes.DOCTORS_CASES_DIAGNOSE_CASE} component={DiagnoseCaseContainer} />
          <Route path={routes.DOCTORS_NEW} component={AddDoctor} />

          <Route exact path={routes.PATIENTS_CASES_NEW} component={NewCase} />
          <Route exact path={routes.PATIENTS_CASES} component={PatientDashboard} />
          <Route path={routes.PATIENTS_CASE} component={PatientCaseContainer} />

          <Redirect from={routes.HOME} exact to={routes.WELCOME} />

          <Route path={routes.HOME} component={FourOhFour} />
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

export default hot(module)(withRouter(App))
