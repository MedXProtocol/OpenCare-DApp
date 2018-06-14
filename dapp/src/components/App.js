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
import { Mint } from './mint'
import { WalletContainer } from './wallet'
import { EmergencyKit } from './emergency-kit'
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

          <Route path='/emergency-kit' component={EmergencyKit} />
          <Route path='/sign-in' component={SignInContainer} />
          <Route path='/sign-up' component={SignUpContainer} />
          <Route path='/mint' component={Mint} />
          <Route path='/wallet' component={WalletContainer} />

          <Route path='/doctors/cases/open' component={OpenCasesContainer} />
          <Route path='/doctors/cases/diagnose/:caseAddress' component={DiagnoseCaseContainer} />
          <Route path='/doctors/new' component={AddDoctor} />

          <Route exact path='/patients/cases/new' component={NewCase} />
          <Route exact path='/patients/cases' component={PatientDashboard} />
          <Route path='/patients/cases/:caseAddress' component={PatientCaseContainer} />

          <Route path='/' component={FourOhFour} />
        </Switch>
        <ReduxToastr
          timeOut={700000}
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

export default withRouter(App)
