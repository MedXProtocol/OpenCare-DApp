import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import ReactTimeout from 'react-timeout'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { toastr } from '~/toastr'
import { Account, ACCOUNT_VERSION } from '~/accounts/Account'
import { SignInFormContainer } from './SignInForm'
import {
  withSend,
  TransactionStateHandler,
  cacheCall,
  cacheCallValue,
  contractByName,
  withSaga
} from '~/saga-genesis'
import { ScrollToTop } from '~/components/ScrollToTop'
import { BodyClass } from '~/components/BodyClass'
import { Loading } from '~/components/Loading'
import { InfoQuestionMark } from '~/components/InfoQuestionMark'
import { PageTitle } from '~/components/PageTitle'
import { upgradeOldAccount } from '~/services/upgradeOldAccount'
import * as routes from '~/config/routes'

function mapStateToProps(state, ownProps) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  if (!networkId) { return {} }

  const address = get(state, 'sagaGenesis.accounts[0]')
  const signedIn = state.account.signedIn
  const AccountManager = contractByName(state, 'AccountManager')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const transactions = state.sagaGenesis.transactions
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  return {
    networkId,
    address,
    signedIn,
    isDoctor,
    DoctorManager,
    AccountManager,
    transactions,
    account: Account.get(networkId, address)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setSigningIn: () => {
      dispatch({ type: 'SIGNING_IN' })
    },
    signIn: ({ networkId, secretKey, masterPassword, account, address, overrideAccount }) => {
      dispatch({ type: 'SIGN_IN', networkId, secretKey, masterPassword, account, address, overrideAccount })
    }
  }
}

function* saga({ account, DoctorManager }) {
  if (!account || !DoctorManager) { return }
  yield cacheCall(DoctorManager, 'isDoctor', account)
}

export const SignInContainer = ReactTimeout(withSend(withRouter(
  withSaga(saga)(
    connect(mapStateToProps, mapDispatchToProps)(
      class _SignIn extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isResetting: false
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps)

    if (this.state.resetAccountHandler && this.state.transactionId) {
      this.state.resetAccountHandler.handle(nextProps.transactions[this.state.transactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ isResetting: false })
        })
        .onTxHash(() => {
          toastr.success('Your account reset transaction has been sent.')
        })
        .onConfirmed(() => {
          this.setState({ isResetting: false })
          if (this.props.account) {
            this.props.account.destroy()
          }
          this.props.history.push('/')

          toastr.success('Your account has been reset.')
        })
    }
  }

  init(props) {
    if (props.networkId && props.address) {
      upgradeOldAccount(props.networkId, props.address)
    }
  }

  onSubmit = ({ secretKey, masterPassword, overrideAccount }) => {
    // this is solely to update the UI prior to running the decrypt code
    this.props.setSigningIn()

    this.props.setTimeout(() => {
      this.doSubmit({ secretKey, masterPassword, overrideAccount })
    }, 100)
  }

  doSubmit = ({ secretKey, masterPassword, overrideAccount }) => {
    this.props.signIn({
      networkId: this.props.networkId,
      secretKey,
      masterPassword,
      account: this.props.account,
      address: this.props.address,
      overrideAccount
    })
  }

  handleReset = () => {
    let transactionId = this.props.send(this.props.AccountManager, 'setPublicKey', this.props.address, '0x')({ gas: 200000 })

    this.setState({
      resetAccountHandler: new TransactionStateHandler(),
      isResetting: true,
      transactionId
    })
  }

  render () {
    if (!this.props.networkId) { return null }

    const { signedIn, account, isDoctor, isDermatologist } = this.props
    if (signedIn) {
      let path = isDoctor ? routes.DOCTORS_CASES_OPEN : routes.PATIENTS_CASES
      return <Redirect to={path} />
    }

    const shouldResetAccount = account && ((account.getVersion() || 0) < ACCOUNT_VERSION)

    if (shouldResetAccount) {
      var warning =
        <div className='alert alert-danger text-center'>
          <br />
          <p>
            You have a previous beta account that no longer works. &nbsp;
            <InfoQuestionMark
              name="sign-in-info"
              place="bottom"
              tooltipText="We have made changes that break compatibility with old cases.<br />Your account needs to be reset before submitting or diagnosing new cases." />
          </p>
          <br />
          <button
            className='btn btn-danger btn__no-shadow'
            onClick={this.handleReset}>
            Reset Account
          </button>
          <br />
          <br />
        </div>
    }
    return (
      <BodyClass isDark={true}>
        <ScrollToTop />
        <div>
          <PageTitle renderTitle={(t) => t('pageTitles.signIn')} />
          <div className='container'>
            <div className='row'>
              <div className='col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
                <h3 className='text-center text-white title--inverse'>
                  Sign in to Hippocrates
                </h3>
                {warning}
                <SignInFormContainer
                  onSubmit={this.onSubmit}
                  hasAccount={!!account} />

                <div className="account--extras">
                  <p className='text-center text-white'>
                    Don't have an account? <Link to={routes.SIGN_UP}>Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Loading loading={this.state.isResetting} />
        </div>
      </BodyClass>
    )
  }
})))))
