import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { getAccount } from '@/services/get-account'
import { signInWithPublicKeyCheck } from '@/services/sign-in'
import { SignInForm } from '@/components/sign-in-form'
import { getSelectedAccount } from '@/utils/web3-util'
import { connect } from 'react-redux'
import get from 'lodash.get'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'accounts[0]')
  return {
    address,
    account: getAccount(address)
  }
}

export const SignIn = withRouter(connect(mapStateToProps)(class extends Component {
  onSubmit = ({ secretKey, masterPassword }) => {
    signInWithPublicKeyCheck(this.props.account, masterPassword).then(() => {
      this.props.history.push('/')
    })
  }

  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <h1>Sign In</h1>
              <SignInForm onSubmit={this.onSubmit} account={this.props.account}>
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
