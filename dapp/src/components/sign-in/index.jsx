import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { toastr } from '~/toastr'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { Loading } from '~/components/Loading'
import { Account, ACCOUNT_VERSION } from '~/accounts/Account'
import { SignInFormContainer } from './SignInForm'
import { withSend } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'
import { BodyClass } from '~/components/BodyClass'
import * as routes from '~/config/routes'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  const AccountManager = contractByName(state, 'AccountManager')
  const transactions = state.sagaGenesis.transactions
  return {
    address,
    AccountManager,
    transactions,
    account: Account.get(address)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signIn: ({ secretKey, masterPassword, account, address, overrideAccount }) => {
      dispatch({ type: 'SIGN_IN', secretKey, masterPassword, account, address, overrideAccount })
    },
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    }
  }
}

export const SignInContainer = ReactTimeout(withSend(withRouter(connect(mapStateToProps, mapDispatchToProps)(class _SignIn extends Component {
  constructor(props) {
    super(props)

    this.state = {
      signingIn: false,
      isResetting: false
    }
  }

  componentDidMount() {
    this.props.signOut()
  }

  onSubmit = ({ secretKey, masterPassword, overrideAccount }) => {
    this.setState({
      signingIn: true
    }, () => {
      this.props.setTimeout(() => {
        this.doSubmit({ secretKey, masterPassword, overrideAccount })
      }, 100)
    })
  }

  doSubmit = ({ secretKey, masterPassword, overrideAccount }) => {
    this.props.signIn({
      secretKey,
      masterPassword,
      account: this.props.account,
      address: this.props.address,
      overrideAccount
    })
    this.setState({
      signingIn: false
    })
  }

  componentWillReceiveProps(nextProps) {
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
          this.props.account.destroy()
          this.props.history.push('/')

          toastr.success('Your account has been reset.')
        })
    }
  }

  handleReset = () => {
    let transactionId = this.props.send(this.props.AccountManager, 'setPublicKey', '0x')()

    this.setState({
      resetAccountHandler: new TransactionStateHandler(),
      isResetting: true,
      transactionId
    })
  }

  render () {
    if (this.props.account) {
      const version = this.props.account.getVersion() || 0
      if (version < ACCOUNT_VERSION) {
        var warning =
          <div className='alert alert-danger text-center'>
            <br />
            <p>
              You have a previous beta account that no longer works.
            </p>
            <small>
              Up the Gas Limit to run the reset transaction.
            </small>
            <br />
            <button
              className='btn btn-danger btn-outline-inverse btn-no-shadow'
              onClick={this.handleReset}>
              Reset Account
            </button>
            <br />
            <br />
          </div>
      }
    }
    return (
      <BodyClass isDark={true}>
        <MainLayoutContainer>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
                <h3 className='text-white text-center'>
                  Sign in to Hippocrates
                </h3>
                {warning}
                <SignInFormContainer
                  signingIn={this.state.signingIn}
                  onSubmit={this.onSubmit}
                  hasAccount={!!this.props.account} />

                <div className="account--extras">
                  <p className='text-center text-white'>
                    Don't have an account? <Link to={routes.SIGN_UP}>Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Loading loading={this.state.isResetting} />
        </MainLayoutContainer>
      </BodyClass>
    )
  }
}))))
