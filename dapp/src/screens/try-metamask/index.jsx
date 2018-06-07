import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { withRouter, Link } from 'react-router-dom'
import { getAccount } from '@/services/get-account'
import { SignInForm } from '@/components/sign-in-form'
import { connect } from 'react-redux'
import get from 'lodash.get'

export const TryMetamask = class extends Component {
  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 col-sm-offset-3'>
              <h2>You need to use an Ethereum-enabled browser for this app</h2>
              <p>
                If you're using Chrome or Firefox, you can use <a href='https://metamask.io' target='_blank'>MetaMask</a>.
              </p>
              <p>
                If you're on iOS or Android try <a href='https://trustwalletapp.com' target='_blank'>Trust Wallet</a>
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}
