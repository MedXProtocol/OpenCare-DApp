import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'

function mapStateToProps (state) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  let signedIn = get(state, 'account.signedIn')
  return {
    address,
    signedIn,
    account: Account.get(address)
  }
}

export const Welcome = connect(mapStateToProps)(class _Welcome extends Component {
  render () {
    if (this.props.signedIn) {
      var launchLink = '/patients/cases'
    } else
    if (this.props.account) {
      launchLink = '/sign-in'
    } else {
      launchLink = '/sign-up'
    }

    return (
      <BodyClass isDark={true}>
        <MainLayoutContainer doNetworkCheck={false}>
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-md-10 col-md-offset-1'>
                <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                  <div className="form-wrapper--body">
                    <h3>
                      Welcome to Hippocrates!
                      <br /><small>The first DApp in the MedCredits Health System</small>
                    </h3>

                    <hr />
                    <p>
                      Get a medical recommendation instantly from a global network of dermatologists, with one free evaluation during Beta testing on the <strong>Rinkeby</strong> Testnet.
                    </p>
                    <p>
                      Doctors are compensated in real MEDX for services rendered.
                    </p>
                    <ol>
                      <li>
                        Download the Metamask Chrome Extension
                      </li>
                      <li>
                        Obtain free ETH on Rinkeby Test Net from a public faucet
                      </li>
                      <li>
                        Obtain MEDX Test tokens (MEDT) from a public faucet
                      </li>
                    </ol>
                  </div>

                  <div className="form-wrapper--footer">
                    <div className='text-right'>
                      <Link
                        className="btn btn-success"
                        to={launchLink}>
                          Launch Hippocrates
                      </Link>
                    </div>
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
