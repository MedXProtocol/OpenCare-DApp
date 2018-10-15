import React, { Component } from 'react'
import { BodyClass } from '~/components/BodyClass'
import DownloadMetamaskButtonImg from '~/assets/img/button--download-metamask.png'
import AppStoreButtonImg from '~/assets/img/button--app-store.png'
import PlayStoreButtonImg from '~/assets/img/button--play-store.png'
import GetCoinbaseWalletImg from '~/assets/img/getCoinbaseWallet.svg'
import { getMobileOperatingSystem } from '~/utils/getMobileOperatingSystem'

import { PageTitle } from '~/components/PageTitle'

export const TryMetamask = class _TryMetamask extends Component {
  render () {
    const itunesLink = 'https://itunes.apple.com/us/app/coinbase-wallet/id1278383455?mt=8'
    const androidLink = 'https://play.google.com/store/apps/details?id=org.toshi&hl=en_CA'

    const link = getMobileOperatingSystem() === 'iOS' ? itunesLink : androidLink

    return (
      <BodyClass isDark={true}>
        <PageTitle renderTitle={(t) => t('pageTitles.tryMetaMask')} />
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
              <h3 className='text-white text-center title--inverse'>
                To use OpenCare you will need to use an Ethereum wallet
              </h3>

              <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                <div className="form-wrapper--body form-wrapper--body__extra-padding text-center">
                  <h3>
                    Use a DApp browser
                  </h3>
                  <p>
                    Any mobile DApp browser like Coinbase Wallet is supported.
                    If you're new to cryptocurrency we recommend Coinbase Wallet
                    so you can easily purchase Ether:
                  </p>
                  <br />
                  <a
                    href={itunesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Get Coinbase Wallet">
                    <img src={GetCoinbaseWalletImg} alt="Get Coinbase Wallet Button" width="200" />
                  </a>
                  <br />
                  <br />
                  <a
                    href={itunesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download Coinbase Wallet from Apple App Store">
                    <img src={AppStoreButtonImg} alt="Apple App Store Button" width="100" />
                  </a>
                  &nbsp; &nbsp; &nbsp;
                  <a
                    href={androidLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download Coinbase Wallet from Google Play Store">
                    <img src={PlayStoreButtonImg} alt="Google Play Store Button" width="100" />
                  </a>
                  <br />
                  <br />
                  <hr />
                  <br />

                  <p>
                    On desktop, we recommend <a href='https://metamask.io/' title='MetaMask' target="_blank" rel="noopener noreferrer">MetaMask</a> &mdash; a wallet extension for Chrome, Firefox and Brave browsers:
                  </p>
                  <br />
                  <a href="https://metamask.io" title="Download Metamask" target="_blank" rel="noopener noreferrer"><img src={DownloadMetamaskButtonImg} alt="Metamask Download Button" width="200" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BodyClass>
    )
  }
}
