import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { getAccount } from '@/services/get-account'
import { signIn } from '@/services/sign-in'
import { SignInForm } from '@/components/sign-in-form'

class SignInComponent extends Component {
  componentDidMount () {
    this.setState({
      account: getAccount()
    })
  }

  onSubmit = ({ secretKey, masterPassword }) => {
    signIn(getAccount(), masterPassword).then(() => {
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
              <SignInForm onSubmit={this.onSubmit} account={getAccount()}>
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
}

export const SignIn = withRouter(SignInComponent)
