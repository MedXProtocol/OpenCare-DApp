import React, { Component } from 'react'
import { getAccount } from '@/services/get-account'
import { SignInForm } from '@/components/sign-in-form'

export class SignIn extends Component {
  componentDidMount () {
    this.setState({
      account: getAccount()
    })
  }

  onSubmit = ({ secretKey, masterPassword }) => {
    
  }

  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <SignInForm onSubmit={this.onSubmit} />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}
