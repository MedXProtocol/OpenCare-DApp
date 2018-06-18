import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'

export const Welcome = class extends Component {
  render () {
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
                      <strong>NOTE:</strong> This is the Beta v1 of Hippocrates. It's goal is to gather feedback as we improve the software prior to release. Real cases <strong><em>will not</em></strong> be diagnosed by a medical doctor.
                    </p>

                    <hr />
                    <p>
                      Hippocrates provides you with medical recommendations instantly from a global network of dermatologists. Doctors will be compensated in real MEDX for services rendered.
                    </p>
                    <p>
                      Beta testing is on the <strong>Rinkeby</strong> Testnet. To get started:
                    </p>
                    <ol>
                      <li>
                        Download the Metamask Extension (<a target='_blank' rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome</a> / <a target='_blank' rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">Firefox</a>) or the Trust mobile browser (<a target='_blank' rel="noopener noreferrer" href="https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409?mt=8">iOS</a> / <a target='_blank' rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp">Android</a>)
                      </li>
                      <li>
                        Obtain free ETH &amp; MEDX Test Tokens (MEDT) on Rinkeby from <a
                          target="_blank"
                          href="https://t.me/MedCredits"
                          rel="noopener noreferrer">our Telegram group</a>
                      </li>
                      <li>
                        Sign in, give the DApp a try and provide us with constructive feedback
                      </li>
                    </ol>
                  </div>

                  <div className="form-wrapper--footer">
                    <div className='text-right'>
                      <Link
                        className="btn btn-success"
                        to='/sign-up'>
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
}
