import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import metaMaskFoxAndWordmarkImg from '~/assets/img/metamask-fox-and-wordmark.svg'

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
      <BodyClass isDark={true}>
        {redirect}
        <MainLayoutContainer doBetaFaucetModal={false}>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
                <h3 className='text-white text-center'>
                  We see you're using MetaMask, nice!
                </h3>

                <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                  <div className="form-wrapper--body form-wrapper--body__extra-padding text-center">
                    <p className="lead">
                      To continue using Hippocrates please log in to your MetaMask account
                    </p>

                    <img src={metaMaskFoxAndWordmarkImg} alt="MetaMask logo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainLayoutContainer>
      </BodyClass>
    )
  }
})
