import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'
import DownloadMetamaskButtonImg from '~/assets/img/button--download-metamask.png'
import AppStoreButtonImg from '~/assets/img/button--app-store.png'
import PlayStoreButtonImg from '~/assets/img/button--play-store.png'

export const TryMetamask = class extends Component {
  render () {
    return (
      <BodyClass isDark={true}>
        <MainLayoutContainer>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
                <h3 className='text-white text-center'>
                  To use Hippocrates you will need to use an Ethereum wallet
                </h3>

                <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                  <div className="form-wrapper--body form-wrapper--body__extra-padding text-center">
                    <h4>
                      <a href='https://metamask.io/' title='MetaMask' target="_blank" rel="noopener noreferrer">MetaMask</a> is a wallet extension for Chrome, Firefox and Brave browsers:
                    </h4>
                    <br />
                    <a href="https://metamask.io" title="Download Metamask" target="_blank" rel="noopener noreferrer"><img src={DownloadMetamaskButtonImg} alt="Metamask Download Button" width="200" /></a>
                    <br />
                    <br />
                    <hr />
                    <br />
                    <h4>
                      On mobile? Try the Cipher browser:
                    </h4>
                    <a
                      href="https://itunes.apple.com/app/cipher-browser-for-ethereum/id1294572970"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download Cipher from Apple App Store">
                      <img src={AppStoreButtonImg} alt="Apple App Store Button" />
                    </a>
                    &nbsp; &nbsp; &nbsp;
                    <a
                      href="https://play.google.com/store/apps/details?id=com.cipherbrowser.cipher"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download Cipher from Google Play Store">
                      <img src={PlayStoreButtonImg} alt="Google Play Store Button" />
                    </a>
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
