import React, { Component } from 'react'
import { MainLayout } from '~/layouts/MainLayout'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

function mapStateToProps(state, ownProps) {
  return {
    account: state.sagaGenesis.accounts[0]
  }
}

export const LoginToMetaMask = connect(mapStateToProps)(class extends Component {
  render () {
    if (this.props.account) {
      var redirect = <Redirect to='/' />
    }
    return (
      <MainLayout>
        {redirect}
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 col-sm-offset-3 text-center'>
              <h2>You need to log into Metamask to continue</h2>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
})
