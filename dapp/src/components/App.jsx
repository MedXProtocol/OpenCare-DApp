import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import ReactTimeout from 'react-timeout'
import { hot } from 'react-hot-loader'
import { formatRoute } from 'react-router-named-routes'
import { SignUpContainer } from './sign-up'
import { SignInContainer } from './sign-in'
import { PatientDashboard } from './patient/dashboard'
import { NewCase } from './patient/cases/NewCase'
import { PatientCaseContainer } from './patient/cases/PatientCase'
import { AddDoctor } from './doctors/new'
import { Mint } from './account/mint'
import { WalletContainer } from './account/wallet'
import { EmergencyKit } from './account/emergency-kit'
import { ChangePasswordContainer } from './account/change-password'
import { OpenCasesContainer } from './doctors/cases'
import { Welcome } from '~/components/welcome'
import { TryMetamask } from './try-metamask'
import { LoginToMetaMask } from './login-to-metamask'
import { FourOhFour } from './four-oh-four'
import { HippoNavbarContainer } from '~/components/navbar/HippoNavbar'
import { PublicKeyCheck } from '~/components/PublicKeyCheck'
import { BetaFaucetModal } from '~/components/BetaFaucetModal'
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import { ScrollyFeedbackLink } from '~/components/ScrollyFeedbackLink'
import * as routes from '~/config/routes'
import { SignedInRoute } from '~/components/SignedInRoute'
import { Web3Route } from '~/components/Web3Route'
import { AdminFees } from '~/components/AdminFees'
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

  if (isDoctor) {
    doctorCasesCount = cacheCallValueInt(state, CaseManager, 'doctorCasesCount', address)
    openCaseCount = cacheCallValue(state, CaseStatusManager, 'openCaseCount', address)
    nextCaseAddress = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, (doctorCasesCount - 1))
  }

  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)

  return {
    address,
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
    dispatchSignOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

function* saga({ address, CaseManager, CaseStatusManager, DoctorManager, doctorCasesCount, FromBlockNumber }) {
  if (!address || !CaseManager || !DoctorManager || !CaseStatusManager || !FromBlockNumber) { return }
  yield cacheCall(FromBlockNumber, 'blockNumber')
  const isDoctor = yield cacheCall(DoctorManager, 'isDoctor', address)
  if (isDoctor) {
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
    if (nextProps.isSignedIn && nextProps.isDoctor && this.newCaseAssigned && nextProps.nextCaseAddress) {
      this.showNewCaseAssignedToast(nextProps)
    }
  }

  showNewCaseAssignedToast = (nextProps) => {
    const caseRoute = formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress: nextProps.nextCaseAddress })

    toastr.success('You have been assigned a new case.', { path: caseRoute, text: 'View Case' })

    this.newCaseAssigned = false
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
    this.props.dispatchSignOut()
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

    if (this.props.isSignedIn) {
      var publicKeyCheck = <PublicKeyCheck />
      var betaFaucetModal = <BetaFaucetModal />
      var feedbackLink = <ScrollyFeedbackLink scrollDiffAmount={50} />
    }

    if (this.props.isOwner) {
      var ownerWarning =
        <div className="alert alert-warning alert--banner text-center">
          <small>NOTE: You are currently using the contract owner's Ethereum address, please do not submit or diagnose cases with this account for encryption reasons.</small>
        </div>
    }

    const WelcomeWrapped = <Welcome isDoctor={this.props.isDoctor} />

    return (
      <React.Fragment>
        <LogListener address={this.props.CaseManager} fromBlock={this.props.fromBlock} />
        <HippoNavbarContainer openCasesLength={this.props.openCaseCount} />
        {ownerWarning}
        {publicKeyCheck}
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

            <SignedInRoute path={routes.ADMIN_FEES} component={AdminFees} />

            <SignedInRoute path={routes.DOCTORS_NEW} component={AddDoctor} />

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
