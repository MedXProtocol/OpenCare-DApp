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
import { Welcome } from '~/components/welcome'
import { TryMetamask } from './try-metamask'
import { LoginToMetaMask } from './login-to-metamask'
import { FourOhFour } from './four-oh-four'
import * as routes from '~/config/routes'
import { SignedInRoute } from '~/components/SignedInRoute'
import { Web3Route } from '~/components/Web3Route'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { getRequestedPathname } from '~/services/getRequestedPathname'
import { setRequestedPathname } from '~/services/setRequestedPathname'

function mapStateToProps (state, ownProps) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const isSignedIn = get(state, 'account.signedIn')
  return {
    address,
    isSignedIn
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

const App = connect(mapStateToProps, mapDispatchToProps)(class _App extends Component {
  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
    this.onAccountChangeSignOut(this.props)
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  componentWillReceiveProps (nextProps) {
    this.onAccountChangeSignOut(nextProps)
  }

  onAccountChangeSignOut (nextProps) {
    if (this.props.address && this.props.address !== nextProps.address) {
      this.signOut()
    }
  }

  unload = () => {
    if (process.env.NODE_ENV !== 'development') {
      this.signOut()
    }
  }

  signOut () {
    // this.skipRequestedPathname = true
    this.props.signOut()
  }

  render () {
    var redirect
    // const requestedPathname = getRequestedPathname()
    // if (this.props.isSignedIn &&
    //     requestedPathname) {
    //   if (this.skipRequestedPathname) {
    //     this.skipRequestedPathname = false
    //   } else {
    //     var redirect = <Redirect to={requestedPathname} />
    //   }
    //   setRequestedPathname('')
    // }

    return (
      <div>
        <Switch>
          {redirect}

          <Route path={routes.WELCOME} component={Welcome} />
          <Route path={routes.LOGIN_METAMASK} component={LoginToMetaMask} />
          <Route path={routes.TRY_METAMASK} component={TryMetamask} />

          <SignedInRoute path={routes.ACCOUNT_EMERGENCY_KIT} component={EmergencyKit} />
          <SignedInRoute path={routes.ACCOUNT_CHANGE_PASSWORD} component={ChangePasswordContainer} />
          <SignedInRoute path={routes.ACCOUNT_MINT} component={Mint} />
          <SignedInRoute path={routes.ACCOUNT_WALLET} component={WalletContainer} />

          <Web3Route path={routes.SIGN_IN} component={SignInContainer} />
          <Web3Route path={routes.SIGN_UP} component={SignUpContainer} />

          <SignedInRoute path={routes.DOCTORS_CASES_OPEN} component={OpenCasesContainer} />
          <SignedInRoute path={routes.DOCTORS_CASES_DIAGNOSE_CASE} component={DiagnoseCaseContainer} />
          <SignedInRoute path={routes.DOCTORS_NEW} component={AddDoctor} />

          <SignedInRoute exact path={routes.PATIENTS_CASES_NEW} component={NewCase} />
          <SignedInRoute exact path={routes.PATIENTS_CASES} component={PatientDashboard} />
          <SignedInRoute path={routes.PATIENTS_CASE} component={PatientCaseContainer} />

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
})

export default hot(module)(withRouter(App))
