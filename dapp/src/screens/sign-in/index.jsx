import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { getAccount } from '~/services/get-account'
import { SignInForm } from '~/components/sign-in-form'
import { BodyClass } from '~/components/BodyClass'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  let overrideError = state.account.overrideError
  return {
    address,
    account: getAccount(address)
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

export const SignIn = withRouter(connect(mapStateToProps, mapDispatchToProps)(class _SignIn extends Component {

  componentDidMount() {
    this.props.signOut()
  }

  onSubmit = ({ secretKey, masterPassword, overrideAccount }) => {
    this.props.signIn({ secretKey, masterPassword, account: this.props.account, address: this.props.address, overrideAccount })
  }

  render () {
    return (
      <BodyClass isDark={true}>
        <MainLayout>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-8 col-sm-offset-2 col-sm-8 col-sm-offset-2'>
                <h3 className='text-white text-center'>
                  Sign in to <strong>Med</strong>Credits
                </h3>
                <SignInForm onSubmit={this.onSubmit} hasAccount={!!this.props.account} />

                <div className="account--extras">
                  <p className='text-center text-white'>
                    Don't have an account? <Link to='/sign-up'>Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      </BodyClass>
    )
  }
}))
