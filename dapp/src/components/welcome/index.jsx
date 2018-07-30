import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { BodyClass } from '~/components/BodyClass'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import * as routes from '~/config/routes'
import { PageTitle } from '~/components/PageTitle'

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
    let launchLink
    if (this.props.signedIn) {
      if (this.props.isDoctor) {
        launchLink = routes.DOCTORS_CASES_OPEN
      } else {
        launchLink = routes.PATIENTS_CASES
      }
    } else if (this.props.account) {
      launchLink = routes.SIGN_IN
    } else {
      launchLink = routes.SIGN_UP
    }

    return (
      <BodyClass isDark={true}>
        <PageTitle renderTitle={(t) => t('pageTitles.welcome')} />
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-md-10 col-md-offset-1'>
              <div className="form-wrapper form-wrapper--inverse">
                <div className="form-wrapper--body">
                  <h3 className="text-center">
                    Welcome to Hippocrates!
                    <br /><small>The first dApp in the MedCredits Health System</small>
                    <br /><small className="text-gray">Ask a board-certified specialist about your skin ailment today</small>
                  </h3>
                  <hr />
                  <p>
                    It takes under <strong>2 minutes</strong> to submit your case. Seriously, <em>it’s that easy</em>.
                  </p>
                  <ol>
                    <li>
                      Download the MetaMask Extension (<a target='_blank' rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome</a> / <a target='_blank' rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">Firefox</a>) or the Trust mobile browser (<a target='_blank' rel="noopener noreferrer" href="https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409">iOS</a> / <a target='_blank' rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp">Android</a>)
                    </li>
                    <li>
                      Sign up and submit your skin ailment
                    </li>
                    <li>
                      Earn <strong>0.5 MEDX</strong> for every case submitted during our trial period (<a target='_blank' rel="noopener noreferrer"  href="https://medium.com/medcredits/start-earning-medx-on-hippocrates-107662a751d9">see our blog post for additional information</a>)
                    </li>
                  </ol>
                  <hr />
                  <p className="text-danger small">
                    NOTE: This is the public Beta 2.2 of Hippocrates and is for <strong><em>testing purposes</em></strong> only. Cases will not be evaluated by licensed doctors. The public launch on Ethereum mainnet with board-certified doctors is scheduled for October 2018.
                  </p>
                </div>

                <div className="form-wrapper--footer">
                  <div className='text-right'>
                    <Link
                      className="btn btn-lg btn-success"
                      to={launchLink}>
                        Launch Hippocrates
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </BodyClass>
    )
  }
})
