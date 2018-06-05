import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { getAccount } from '@/services/get-account'
import { SignInForm } from '@/components/sign-in-form'
import { connect } from 'react-redux'
import get from 'lodash.get'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  return {
    address,
    account: getAccount(address)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signIn: ({ secretKey, masterPassword, account }) => {
      dispatch({ type: 'SIGN_IN', secretKey, masterPassword, account })
    }
  }
}

export const SignIn = withRouter(connect(mapStateToProps, mapDispatchToProps)(class _SignIn extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  onSubmit = ({ secretKey, masterPassword }) => {
    this.props.signIn({ secretKey, masterPassword, account: this.props.account })
  }

  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <h1>Sign In</h1>
              <SignInForm onSubmit={this.onSubmit} hasAccount={!!this.props.account}>
                <div className='form-group'>
                  <input type='submit' value='Sign In' className='btn btn-primary' />
                </div>
              </SignInForm>
              <p>
                Don't have an account? <Link to='/sign-up'>Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}))
