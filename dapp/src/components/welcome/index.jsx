import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import * as routes from '~/config/routes'

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
      var launchLink = routes.PATIENTS_CASES
    } else
    if (this.props.account) {
      launchLink = routes.SIGN_IN
    } else {
      launchLink = routes.SIGN_UP
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
                    <p className="text-danger">
                      NOTE: This is the private beta v1 of Hippocrates and is for <strong><em>testing purposes</em></strong> only. In this version, submitted cases <strong><em>will not</em></strong> be diagnosed by licensed medical doctors. The goal for this release is to obtain user feedback in preparation for the public beta launch of Hippocrates in July 2018.
                    </p>

                    <hr />
                    <p>
                      Use Hippocrates to obtain a rapid medical recommendation from a global network of dermatologists.
                    </p>
                    <p>
                      Beta testing is on the Rinkeby Testnet. To get started:
                    </p>
                    <ol>
                      <li>
                        Download the MetaMask Extension (<a target='_blank' rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome</a> / <a target='_blank' rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">Firefox</a>) or the Cipher mobile browser (<a target='_blank' rel="noopener noreferrer" href="https://itunes.apple.com/app/cipher-browser-for-ethereum/id1294572970">iOS</a> / <a target='_blank' rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.cipherbrowser.cipher">Android</a>)
                      </li>
                      <li>
                        Obtain free ETH &amp; MEDX Test Tokens (MEDT) on Rinkeby by providing your Rinkeby address <a
                          target="_blank"
                          href="https://t.me/MedCredits"
                          rel="noopener noreferrer">on our Telegram</a>
                      </li>
                      <li>
                        Sign in, submit your skin problem, and visit our <a
                          target="_blank"
                          href="https://t.me/MedCredits"
                          rel="noopener noreferrer">Telegram</a> to provide us with helpful feedback
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
