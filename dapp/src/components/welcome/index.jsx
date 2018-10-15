import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { BodyClass } from '~/components/BodyClass'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import * as routes from '~/config/routes'
import { PageTitle } from '~/components/PageTitle'

function mapStateToProps (state) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const signedIn = get(state, 'account.signedIn')

  return {
    address,
    signedIn,
    account: Account.get(networkId, address)
  }
}

export const Welcome = connect(mapStateToProps)(class _Welcome extends Component {
  ropsten = () => {
    return (this.props.networkId && this.props.networkId === 3)
  }

  render () {
    let launchLink
    if (this.props.signedIn) {
      if (this.props.isDoctor && this.props.isDermatologist) {
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
                    Welcome to OpenCare (also known as Hippocrates)!
                    <br /><small>The first dApp in the MedX (MedCredits) Health System connecting patients and physicians worldwide.</small>
                    <br /><small className="text-gray">Supported medical specialties: Dermatology for skin ailments.</small>
                    <br /><small className="text-gray"><strong>Coming soon:</strong> Ophthalmology, general medicine and radiology</small>
                  </h3>
                  <hr />
                  <p>
                    Submit a case in minutes.
                  </p>
                  <ol>
                    <li>
                      Download the MetaMask Extension (
                        <a target='_blank' rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome</a>
                        &nbsp;/&nbsp;
                        <a target='_blank' rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">Firefox</a>)
                        or the Coinbase Wallet mobile browser (<a target='_blank' rel="noopener noreferrer" href="https://itunes.apple.com/us/app/coinbase-wallet/id1278383455?mt=8">iOS</a>
                        &nbsp;/&nbsp;
                        <a target='_blank' rel="noopener noreferrer" href="https://play.google.com/store/apps/details?id=org.toshi&hl=en_CA">Android</a>)
                    </li>
                    <li>
                      Sign up and submit your skin ailment
                    </li>
                    {
                      this.ropsten() ? (
                        <li>
                          Earn <strong>0.5 MEDX</strong> for every case submitted or diagnosed during our trial period (<a target='_blank' rel="noopener noreferrer"  href="https://medium.com/medxprotocol/start-earning-medx-on-hippocrates-107662a751d9">see our blog post for additional information</a>)
                        </li>
                      ) : null
                    }
                  </ol>
                  <hr />
                  <p className="text-red small">
                    NOTE: This is v1.0 of OpenCare (Hippocrates) on Ethereum mainnet for real consultations. If interested in checking the functionality of the dApp for testing purposes only, please switch your MetaMask account to "Ropsten".
                  </p>
                </div>

                <div className="form-wrapper--footer">
                  <div className='text-right'>
                    <Link
                      className="btn btn-lg btn-success"
                      to={launchLink}>
                        Launch OpenCare
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
