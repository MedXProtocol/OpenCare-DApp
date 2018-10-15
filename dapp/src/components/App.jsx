import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import ReactTimeout from 'react-timeout'
import { hot } from 'react-hot-loader'
import { formatRoute } from 'react-router-named-routes'
import { newAsyncWrap } from '~/components/newAsyncWrap'
import { EmergencyKit } from '~/components/account/emergency-kit'
import { ChangePasswordContainer } from '~/components/account/change-password'
import { Welcome } from '~/components/welcome'
import { TryMetamask } from '~/components/get-wallet'
import { LoginToMetaMask } from '~/components/login-to-metamask'
import { FourOhFour } from '~/components/four-oh-four'
import { DebugLink } from '~/components/DebugLink'
import { HippoNavbarContainer } from '~/components/navbar/HippoNavbar'
import { AcceptAllExpiredCases } from '~/components/AcceptAllExpiredCases'
import { UserAgentCheckModal } from '~/components/UserAgentCheckModal'
import { UsageRestrictionsModal }  from '~/components/UsageRestrictionsModal'
import { PublicKeyListener } from '~/components/PublicKeyListener'
import { PublicKeyCheck } from '~/components/PublicKeyCheck'
import { BetaFaucetModal } from '~/components/BetaFaucetModal'
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import { ScrollyFeedbackLink } from '~/components/ScrollyFeedbackLink'
import { isBlank } from '~/utils/isBlank'
import * as routes from '~/config/routes'
import { SignedInRoute } from '~/components/SignedInRoute'
import { Web3Route } from '~/components/Web3Route'
import { bugsnagClient } from '~/bugsnagClient'
import { DebugLog } from '~/components/DebugLog'
import { connect } from 'react-redux'
import {
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  cacheCallValueBigNumber,
  contractByName,
  LogListener,
  withSaga
} from '~/saga-genesis'
import { getRequestedPathname } from '~/services/getRequestedPathname'
import { setRequestedPathname } from '~/services/setRequestedPathname'
import { toastr } from '~/toastr'
import get from 'lodash.get'
import { fixAddress } from '~/utils/fixAddress'

const PatientDashboard = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: "PatientDashboard" */ './patient/dashboard'),
  name: 'PatientDashboard'
})

const WalletContainer = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'WalletContainer' */ './account/wallet'),
  name: 'WalletContainer'
})

const PatientCaseContainer = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'PatientCaseContainer' */ './patient/cases/PatientCase'),
  name: 'PatientCaseContainer'
})

const NewCase = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'NewCase' */ './patient/cases/NewCase'),
  name: 'NewCase'
})

const OpenCasesContainer = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'OpenCasesContainer' */ './doctors/cases'),
  name: 'OpenCasesContainer'
})

const Mint = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'Mint' */ './account/mint'),
  name: 'Mint'
})

const AdminSettings = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'AdminSettings' */ './admin/AdminSettings'),
  name: 'AdminSettings'
})

const AdminDoctors = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'AdminDoctors' */ './admin/AdminDoctors'),
  name: 'AdminDoctors'
})

const AdminFees = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'AdminFees' */ './admin/AdminFees'),
  name: 'AdminFees'
})

const AdminCases = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'AdminCases' */ './admin/AdminCases'),
  name: 'AdminCases'
})

const SignUpContainer = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'SignUpContainer' */ './sign-up'),
  name: 'SignUpContainer'
})

const SignInContainer = newAsyncWrap({
  createImport: () => import(/* webpackChunkName: 'SignInContainer' */ './sign-in'),
  name: 'SignInContainer'
})

function mapStateToProps (state) {
  let nextCaseAddress, doctorCasesCount, openCaseCount

  const address = get(state, 'sagaGenesis.accounts[0]')
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const BetaFaucet = contractByName(state, 'BetaFaucet')
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
    nextCaseAddress = fixAddress(cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, (doctorCasesCount - 1)))
  }

  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)

  return {
    address,
    networkId,
    isDermatologist,
    isDoctor,
    FromBlockNumber,
    fromBlock,
    BetaFaucet,
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

const App = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    class _App extends Component {
      constructor(props) {
        super(props)
        this.state = {
          debugging: false
        }
      }

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
    const addressDoesNotMatch = this.props.address && this.props.address !== nextProps.address
    const networkDoesNotMatch = this.props.networkId && this.props.networkId !== nextProps.networkId
    if (addressDoesNotMatch || networkDoesNotMatch) {
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

  handleBugsnagTrigger = () => {
    bugsnagClient.notify({
      name: 'Manually Triggered Test Error',
      message: 'This was triggered manually. Please ignore'
    })
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
      if (!isBlank(this.props.BetaFaucet)) {
        var betaFaucetModal = <BetaFaucetModal />
      } else {
        var usageRestrictionsModal = <UsageRestrictionsModal />
      }
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
      if (this.state.debugging) {
        var debugLog =
          <div>
            <hr />
            <DebugLog />
          </div>
      }
      var debugLink =
        <div>
          <DebugLink />
          &nbsp;
          <a onClick={this.handleBugsnagTrigger} className='btn btn-danger'>Trigger Bugsnag Notification</a>
          &nbsp;
          <a onClick={() => this.setState({ debugging: !this.state.debugging })} className='btn btn-info'>Toggle Log</a>
          {debugLog}
        </div>
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
          {usageRestrictionsModal}

          <Switch>
            <Route path={routes.WELCOME} component={null} />
            <Route path='/' component={NetworkCheckModal} />
          </Switch>

          <Switch>
            {redirect}

            <Route path={routes.WELCOME} render={ () => WelcomeWrapped } />
            <Route path={routes.LOGIN_METAMASK} component={LoginToMetaMask} />
            <Route path={routes.GET_WALLET} component={TryMetamask} />

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

            <SignedInRoute path={routes.ADMIN_SETTINGS} component={AdminSettings} />
            <SignedInRoute path={routes.ADMIN_DOCTORS} component={AdminDoctors} />
            <SignedInRoute path={routes.ADMIN_FEES} component={AdminFees} />
            <SignedInRoute path={routes.ADMIN_CASES} component={AdminCases} />

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
                  &copy; 2018 MedX Protocol - All Rights Reserved
                </p>
                {debugLink}
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
})))

export default hot(module)(withRouter(App))
