import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'

export const LoginToMetaMask = class extends Component {
  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2 text-center'>
              <h2>You need to log into Metamask to continue</h2>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}
