import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import ReactTimeout from 'react-timeout'
import { hot } from 'react-hot-loader'
import { formatRoute } from 'react-router-named-routes'
import { SignUpContainer } from '~/components/sign-up'
import { SignInContainer } from '~/components/sign-in'
import { PatientDashboard } from '~/components/patient/dashboard'
import { NewCase } from '~/components/patient/cases/NewCase'
import { PatientCaseContainer } from '~/components/patient/cases/PatientCase'
import { AdminSettings } from '~/components/AdminSettings'
import { AddDoctor } from '~/components/doctors/new'
import { AdminFees } from '~/components/AdminFees'
import { Mint } from '~/components/account/mint'
import { WalletContainer } from '~/components/account/wallet'
import { EmergencyKit } from '~/components/account/emergency-kit'
import { ChangePasswordContainer } from '~/components/account/change-password'
import { OpenCasesContainer } from '~/components/doctors/cases'
import { Welcome } from '~/components/welcome'
import { TryMetamask } from '~/components/try-metamask'
import { LoginToMetaMask } from '~/components/login-to-metamask'
import { FourOhFour } from '~/components/four-oh-four'
import { DebugLink } from '~/components/DebugLink'
import { HippoNavbarContainer } from '~/components/navbar/HippoNavbar'
import { AcceptAllExpiredCases } from '~/components/AcceptAllExpiredCases'
import { UserAgentCheckModal } from '~/components/UserAgentCheckModal'
import { PublicKeyListener } from '~/components/PublicKeyListener'
import { PublicKeyCheck } from '~/components/PublicKeyCheck'
import { BetaFaucetModal } from '~/components/BetaFaucetModal'
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import { ScrollyFeedbackLink } from '~/components/ScrollyFeedbackLink'
import * as routes from '~/config/routes'
import { SignedInRoute } from '~/components/SignedInRoute'
import { Web3Route } from '~/components/Web3Route'
import { connect } from 'react-redux'
import {
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  cacheCallValueBigNumber,
  contractByName,
  LogListener,
  withSaga,
  withContractRegistry
} from '~/saga-genesis'
import { getRequestedPathname } from '~/services/getRequestedPathname'
import { setRequestedPathname } from '~/services/setRequestedPathname'
import { toastr } from '~/toastr'
import get from 'lodash.get'

function mapStateToProps (state) {
  let nextCaseAddress, doctorCasesCount, openCaseCount

  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const FromBlockNumber = contractByName(state, 'FromBlockNumber')
  const fromBlock = cacheCallValueBigNumber(state, FromBlockNumber, 'blockNumber')

  const isSignedIn = get(state, 'account.signedIn')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const isDermatologist = cacheCallValue(state, DoctorManager, 'isDermatologist', address)

  if (isDoctor && isDermatologist) {
    doctorCasesCount = cacheCallValueInt(state, CaseManager, 'doctorCasesCount', address)
    openCaseCount = cacheCallValue(state, CaseStatusManager, 'openCaseCount', address)
    nextCaseAddress = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, (doctorCasesCount - 1))
  }

  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)

  return {
    address,
    isDermatologist,
    isDoctor,
    FromBlockNumber,
    fromBlock,
    DoctorManager,
    isSignedIn,
    doctorCasesCount,
    openCaseCount,
    CaseManager,
    CaseStatusManager,
    nextCaseAddress,
    isOwner
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatchWeb3SHHInit: () => {
      dispatch({ type: 'WEB3_SHH_INIT' })
    },
    dispatchSignOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

function* saga({ address, CaseManager, CaseStatusManager, DoctorManager, doctorCasesCount, FromBlockNumber }) {
  if (!address || !CaseManager || !DoctorManager || !CaseStatusManager || !FromBlockNumber) { return }
  yield cacheCall(FromBlockNumber, 'blockNumber')
  const isDoctor = yield cacheCall(DoctorManager, 'isDoctor', address)
  const isDermatologist = yield cacheCall(DoctorManager, 'isDermatologist', address)
  if (isDoctor && isDermatologist) {
    yield cacheCall(CaseManager, 'doctorCasesCount', address)
    yield cacheCall(CaseStatusManager, 'openCaseCount', address)

    if (doctorCasesCount) {
      yield cacheCall(CaseManager, 'doctorCaseAtIndex', address, (doctorCasesCount - 1))
    }
  }
}

const App = ReactTimeout(withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    class _App extends Component {

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
    this.onAccountChangeSignOut(this.props)

    if (process.env.NODE_ENV !== 'development' && !this.props.address && this.props.isSignedIn) {
      this.signOut()
    }

    if (process.env.NODE_ENV === 'development' && this.props.isSignedIn) {
      // wait 5 seconds to ensure the sagas have initialized first
      // we should update our architecture so sagas init first, then components
      this.props.setTimeout(() => {
        this.props.dispatchWeb3SHHInit()
      }, 5000)
    }
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)
  }

  componentWillReceiveProps (nextProps) {
    this.onAccountChangeSignOut(nextProps)

    // We know new case data is incoming so mark it that we are ready to show it
    if (
      !this.newCaseAssigned
      && this.props.nextCaseAddress
      && nextProps.nextCaseAddress === undefined
    ) {
      this.newCaseAssigned = true
    }

    // We have a new case assigned and the new case address from the blockchain
    if (
         nextProps.isSignedIn
      && nextProps.isDoctor
      && nextProps.isDermatologist
      && this.newCaseAssigned
      && nextProps.nextCaseAddress
    ) {
      this.showNewCaseAssignedToast(nextProps)
    }
  }

  showNewCaseAssignedToast = (nextProps) => {
    const caseRoute = formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress: nextProps.nextCaseAddress })

    toastr.success('You have been assigned a new case.', { path: caseRoute, text: 'View Case' })

    this.newCaseAssigned = false
  }

  onAccountChangeSignOut (nextProps) {
    // Sign out the localStorage/browser session when the users Eth address changes
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
    this.props.dispatchSignOut()
    this.props.history.push(routes.WELCOME)
  }

  render () {
    const requestedPathname = getRequestedPathname()
    if (this.props.address &&
      this.props.isSignedIn &&
      requestedPathname
    ) {
      if (this.skipRequestedPathname) {
        this.skipRequestedPathname = false
      } else {
        var redirect = <Redirect to={requestedPathname} />
      }
      setRequestedPathname('')
    }

    var publicKeyListener = <PublicKeyListener dispatchSignOut={this.props.dispatchSignOut} />

    if (this.props.isSignedIn) {
      var userAgentCheckModal = <UserAgentCheckModal />
      var publicKeyCheck = <PublicKeyCheck />
      var betaFaucetModal = <BetaFaucetModal />
      var feedbackLink = <ScrollyFeedbackLink scrollDiffAmount={50} />

      if (this.props.isDoctor && this.props.isDermatologist) {
        var acceptAllExpiredCases = <AcceptAllExpiredCases />
      }
    }

    if (this.props.isOwner) {
      var ownerWarning =
        <div className="alert alert-warning alert--banner text-center">
          <small>NOTE: You are currently using the contract owner's Ethereum address, please do not submit or diagnose cases with this account for encryption reasons.</small>
        </div>
    }

    if (process.env.REACT_APP_ENABLE_FIREBUG_DEBUGGER) {
      var debugLink = <DebugLink />
    }

    const WelcomeWrapped = <Welcome
      isDoctor={this.props.isDoctor}
      isDermatologist={this.props.isDermatologist}
    />

    return (
      <React.Fragment>
        <LogListener address={this.props.CaseManager} fromBlock={this.props.fromBlock} />
        <HippoNavbarContainer openCasesLength={this.props.openCaseCount} />
        {ownerWarning}
        {userAgentCheckModal}
        {publicKeyCheck}
        {publicKeyListener}
        {acceptAllExpiredCases}
        <div className="content">
          {betaFaucetModal}

          <Switch>
            <Route path={routes.WELCOME} component={null} />
            <Route path='/' component={NetworkCheckModal} />
          </Switch>

          <Switch>
            {redirect}

            <Route path={routes.WELCOME} render={ () => WelcomeWrapped } />
            <Route path={routes.LOGIN_METAMASK} component={LoginToMetaMask} />
            <Route path={routes.TRY_METAMASK} component={TryMetamask} />

            <SignedInRoute path={routes.ACCOUNT_EMERGENCY_KIT} component={EmergencyKit} />
            <SignedInRoute path={routes.ACCOUNT_CHANGE_PASSWORD} component={ChangePasswordContainer} />
            <SignedInRoute path={routes.ACCOUNT_MINT} component={Mint} />
            <SignedInRoute path={routes.ACCOUNT_WALLET} component={WalletContainer} />

            <Web3Route path={routes.SIGN_IN} component={SignInContainer} />
            <Web3Route path={routes.SIGN_UP} component={SignUpContainer} />

            <SignedInRoute path={routes.DOCTORS_CASES_OPEN}
              component={OpenCasesContainer}
            />
            <SignedInRoute exact path={routes.DOCTORS_CASES_OPEN_PAGE_NUMBER}
              component={OpenCasesContainer}
            />
            <SignedInRoute exact path={routes.DOCTORS_CASES_DIAGNOSE_CASE}
              component={OpenCasesContainer}
            />

            <SignedInRoute path={routes.ADMIN_DAPP_SETTINGS} component={AdminSettings} />
            <SignedInRoute path={routes.DOCTORS_NEW} component={AddDoctor} />
            <SignedInRoute path={routes.ADMIN_FEES} component={AdminFees} />

            <SignedInRoute exact path={routes.PATIENTS_CASES_NEW} component={NewCase} />

            <Redirect exact from={routes.PATIENTS_CASES} to={formatRoute(routes.PATIENTS_CASES_PAGE_NUMBER, { currentPage: 1 })} />
            <SignedInRoute path={routes.PATIENTS_CASE} component={PatientCaseContainer} />
            <SignedInRoute path={routes.PATIENTS_CASES_PAGE_NUMBER} component={PatientDashboard} />

            <Redirect from={routes.HOME} exact to={routes.WELCOME} />

            <Route path={routes.HOME} component={FourOhFour} />
          </Switch>
        </div>

        <footer className="footer">
          <div className='container'>
            <div className="row">
              <div className="col-sm-12 text-center">
                <p className="text-footer">
                  &copy; 2018 MedCredits Inc. - All Rights Reserved.
                  <br />{debugLink}
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ReduxToastr
          timeOut={7000}
          newestOnTop={true}
          tapToDismiss={false}
          position="bottom-left"
          transitionIn="bounceIn"
          transitionOut="bounceOut"
        />
        {feedbackLink}
      </React.Fragment>
  )
}
}))))

export default hot(module)(withRouter(App))
