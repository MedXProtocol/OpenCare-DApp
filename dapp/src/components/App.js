import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import { hot } from 'react-hot-loader'
import { formatRoute } from 'react-router-named-routes'
import getWeb3 from '~/get-web3'
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
import { withSaga, cacheCallValue, withContractRegistry } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'
import { cacheCall } from '~/saga-genesis/sagas'
import { getRequestedPathname } from '~/services/getRequestedPathname'
import { setRequestedPathname } from '~/services/setRequestedPathname'
import { toastr } from '~/toastr'

function mapStateToProps (state, ownProps) {
  let caseCount
  const CaseManager = contractByName(state, 'CaseManager')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const isSignedIn = get(state, 'account.signedIn')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)

  if (isSignedIn && isDoctor) {
    caseCount = parseInt(cacheCallValue(state, CaseManager, 'doctorCasesCount', address), 10)
  }

  return {
    address,
    isDoctor,
    DoctorManager,
    isSignedIn,
    caseCount,
    CaseManager
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

function* saga({ address, CaseManager, DoctorManager }) {
  if (!address || !CaseManager || !DoctorManager) { return }
  yield cacheCall(CaseManager, 'doctorCasesCount', address)
  yield cacheCall(DoctorManager, 'isDoctor', address)
}

const App = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga, { propTriggers: ['address', 'caseCount', 'CaseManager', 'DoctorManager', 'isDoctor'] })(
    class _App extends Component {

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
    this.onAccountChangeSignOut(this.props)
    if (process.env.NODE_ENV !== 'development' && !this.props.address && this.props.isSignedIn) {
      this.signOut()
    }
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  componentWillReceiveProps (nextProps) {
    this.onAccountChangeSignOut(nextProps)

    this.showNewCaseAssignedToast(nextProps)
  }

  showNewCaseAssignedToast = (nextProps) => {
    const { contractRegistry, CaseManager, address } = this.props
    const oldCaseCount = this.props.caseCount

    // Moving from 0 to 1, or 1 to 2, but not undefined/NaN (initial state) to a number
    if ((oldCaseCount === undefined) || (oldCaseCount === nextProps.caseCount)) {
      return
    }

    const CaseManagerInstance = contractRegistry.get(CaseManager, 'CaseManager', getWeb3())
    CaseManagerInstance.methods
      .doctorCaseAtIndex(address, nextProps.caseCount - 1)
      .call().then(caseAddress => {
        console.log(caseAddress)
        const caseRoute = formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress })

        toastr.success('You have been assigned a new case.', { path: caseRoute, text: 'View Case' })
      }).catch(err => {
        console.log(err.message);
      });
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
    this.skipRequestedPathname = true
    this.props.signOut()
  }

  render () {
    const requestedPathname = getRequestedPathname()
    if (this.props.address &&
        this.props.isSignedIn &&
        requestedPathname) {
      if (this.skipRequestedPathname) {
        this.skipRequestedPathname = false
      } else {
        var redirect = <Redirect to={requestedPathname} />
      }
      setRequestedPathname('')
    }

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
})))

export default hot(module)(withRouter(App))
