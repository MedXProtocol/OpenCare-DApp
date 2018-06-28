import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account, ACCOUNT_VERSION } from '~/accounts/Account'
import { SignInFormContainer } from './SignInForm'
import { nextId } from '~/saga-genesis/transaction/transaction-factory'
import { BodyClass } from '~/components/BodyClass'
import * as routes from '~/config/routes'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  return {
    address,
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

export const SignInContainer = ReactTimeout(withRouter(connect(mapStateToProps, mapDispatchToProps)(class _SignIn extends Component {
  constructor(props) {
    super(props)

    this.state = {
      signingIn: false
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
          this.setState({
            signingIn: false
          })
        })
        .onTxHash(() => {
          toastr.success('Your account reset transaction has been sent.')
        })
        .onConfirmed(() => {
          this.props.account.destroy()
          this.props.history.push('/')

          toastr.success('Your account has been reset.')
        })
    }
  }

  handleReset = () => {
    dispatchResetAccount()

    let transactionId = nextId()
    this.setState({
      resetAccountHandler: new TransactionStateHandler(),
      signingIn: true,
      transactionId
    })
  }

  render () {
    if (this.props.account) {
      const version = this.props.account.getVersion() || 0
      if (version < ACCOUNT_VERSION) {
        var warning =
          <div className='alert alert-danger'>
            <p>
              You have an old account that no longer works.
            </p>
            <button
              className='btn btn-danger btn-outline-inverse btn-no-shadow'
              onClick={this.handleReset}>
              Reset Account
            </button>
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
        </MainLayoutContainer>
      </BodyClass>
    )
  }
})))
