import React, { Component } from 'react'
import { MainLayout } from '~/layouts/MainLayout'

export const TryMetamask = class extends Component {
  render () {
    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 col-sm-offset-3'>
              <h2>You need to use an Ethereum-enabled browser for this app</h2>
              <p>
                If you're using Chrome or Firefox, you can use <a href='https://metamask.io' target='_blank' rel="noopener noreferrer">MetaMask</a>.
              </p>
              <p>
                If you're on iOS or Android try <a href='https://trustwalletapp.com' target='_blank' rel="noopener noreferrer">Trust Wallet</a>
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}
