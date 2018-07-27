import React, { Component } from 'react'
import { withRouter, Route, Switch, Redirect } from 'react-router-dom'
import { all } from 'redux-saga/effects'
import ReduxToastr from 'react-redux-toastr'
import ReactTimeout from 'react-timeout'
import { hot } from 'react-hot-loader'
import { formatRoute } from 'react-router-named-routes'
import getWeb3 from '~/get-web3'
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
import { HippoNavbarContainer } from '~/components/HippoNavbar'
import { PublicKeyCheck } from '~/components/PublicKeyCheck'
import { BetaFaucetModal } from '~/components/BetaFaucetModal'
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import { ScrollyFeedbackLink } from '~/components/ScrollyFeedbackLink'
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
import { populateCases, populateCasesSaga } from '~/services/populateCases'
import { toastr } from '~/toastr'
import { defined } from '~/utils/defined'

function mapStateToProps (state) {
  let caseCount
  let cases = []
  const CaseManager = contractByName(state, 'CaseManager')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const isSignedIn = get(state, 'account.signedIn')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)

  if (isSignedIn && isDoctor) {
    caseCount = get(state, 'userStats.caseCount')
    // caseCount = parseInt(cacheCallValue(state, CaseManager, 'doctorCasesCount', address), 10)

    cases = populateCases(state, CaseManager, address, caseCount)
  }

  return {
    address,
    cases,
    isDoctor,
    DoctorManager,
    isSignedIn,
    caseCount,
    CaseManager,
    isOwner
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    },
    dispatchNewCaseCount: (caseCount) => {
      dispatch({ type: 'UPDATE_CASE_COUNT', caseCount })
    }
  }
}

function* saga({ address, caseCount, CaseManager, DoctorManager }) {
  if (!address || !CaseManager || !DoctorManager) { return }

  yield all([
    cacheCall(CaseManager, 'doctorCasesCount', address),
    cacheCall(DoctorManager, 'isDoctor', address)
  ])

  if (caseCount) {
    yield populateCasesSaga(CaseManager, address, caseCount)
  }
}

const App = ReactTimeout(withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga, { propTriggers: ['address', 'caseCount', 'CaseManager', 'DoctorManager', 'isDoctor'] })(
    class _App extends Component {

  componentDidMount () {
    window.addEventListener("beforeunload", this.unload)
    window.addEventListener("focus", this.refocus)
    this.onAccountChangeSignOut(this.props)
    if (process.env.NODE_ENV !== 'development' && !this.props.address && this.props.isSignedIn) {
      this.signOut()
    }

    // Remove this when we figure out how to update the Challenged Doctor's cases list
    // automatically from the block listener!
    this.pollNewCaseID = this.props.setInterval(this.pollForNewCase, 2000)
  }

  // Remove this when we figure out how to update the Challenged Doctor's cases list
  // automatically from the block listener!
  pollForNewCase = async () => {
    const { contractRegistry, CaseManager, address, isDoctor, isSignedIn } = this.props

    if (!CaseManager || !address || !isDoctor || !isSignedIn) { return }

    const CaseManagerInstance = contractRegistry.get(CaseManager, 'CaseManager', getWeb3())
    const newCaseCount = await CaseManagerInstance.methods.doctorCasesCount(address).call().then(caseCount => {
      return caseCount
    })

    if (newCaseCount !== this.props.caseCount) {
      this.props.dispatchNewCaseCount(newCaseCount)
    }
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.unload)
    window.removeEventListener("focus", this.refocus)

    clearInterval(this.pollNewCaseID)
  }

  componentWillReceiveProps (nextProps) {
    this.onAccountChangeSignOut(nextProps)

    this.showNewCaseAssignedToast(nextProps)
  }

  showNewCaseAssignedToast = (nextProps) => {
    const { contractRegistry, CaseManager, address } = this.props
    const oldCaseCount = this.props.caseCount

    // Moving from 0 to 1, or 1 to 2, but not undefined/NaN (initial state) to a number
    if (
      (!defined(oldCaseCount))
      || isNaN(nextProps.caseCount)
      || (oldCaseCount === nextProps.caseCount)
    ) {
      return
    }

    const CaseManagerInstance = contractRegistry.get(CaseManager, 'CaseManager', getWeb3())
    CaseManagerInstance.methods
      .doctorCaseAtIndex(address, nextProps.caseCount - 1)
      .call().then(caseAddress => {
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
      <div>
        <div className="wrapper">
          <div className="main-panel">
            <HippoNavbarContainer cases={this.props.cases} />
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

                <Route path={routes.WELCOME}  render={ () => WelcomeWrapped } />
                <Route path={routes.LOGIN_METAMASK} component={LoginToMetaMask} />
                <Route path={routes.TRY_METAMASK} component={TryMetamask} />

                <SignedInRoute path={routes.ACCOUNT_EMERGENCY_KIT} component={EmergencyKit} />
                <SignedInRoute path={routes.ACCOUNT_CHANGE_PASSWORD} component={ChangePasswordContainer} />
                <SignedInRoute path={routes.ACCOUNT_MINT} component={Mint} />
                <SignedInRoute path={routes.ACCOUNT_WALLET} component={WalletContainer} />

                <Web3Route path={routes.SIGN_IN} component={SignInContainer} />
                <Web3Route path={routes.SIGN_UP} component={SignUpContainer} />

                <SignedInRoute path={routes.DOCTORS_CASES_OPEN} component={OpenCasesContainer} />
                <SignedInRoute path={routes.DOCTORS_CASES_DIAGNOSE_CASE} component={OpenCasesContainer} />
                <SignedInRoute path={routes.DOCTORS_NEW} component={AddDoctor} />

                <SignedInRoute exact path={routes.PATIENTS_CASES_NEW} component={NewCase} />
                <SignedInRoute exact path={routes.PATIENTS_CASES} component={PatientDashboard} />
                <SignedInRoute path={routes.PATIENTS_CASE} component={PatientCaseContainer} />

                <Redirect from={routes.HOME} exact to={routes.WELCOME} />

                <Route path={routes.HOME} component={FourOhFour} />
              </Switch>
            </div>
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
        </div>

        <ReduxToastr
          timeOut={7000}
          newestOnTop={true}
          tapToDismiss={false}
          position="bottom-left"
          transitionIn="bounceIn"
          transitionOut="bounceOut"
        />
        {feedbackLink}
      </div>
    )
  }
}))))

export default hot(module)(withRouter(App))
