import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import getWeb3 from '~/get-web3'
import AppStoreButtonImg from '~/assets/img/button--app-store.png'
import PlayStoreButtonImg from '~/assets/img/button--play-store.png'

function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS"
  } else if (/android/i.test(userAgent)) {
    return "Android"
  }

  return "unknown"
}

function unsupportedBrowser() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Cipher & Status are not supported
  // Cipher is discontinued
  // Status doesn't support file uploads and is generally not ready for production
  // (Status claims the `isStatus` bool should be set but it wasn't on Android Sept 7/2018)
  if (/Cipher/.test(userAgent)) {
    return true
  } else if (getWeb3().currentProvider && getWeb3().currentProvider.isStatus) {
    return true
  }

  return false
}

export const UserAgentCheckModal = class _UserAgentCheckModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hidden: false
    }
  }

  handleCloseModal = () => {
    this.setState({
      hidden: true
    })
  }

  render () {
    const isVisible = unsupportedBrowser() && !this.state.hidden

    const androidLink = <a
        href="https://play.google.com/store/apps/details?id=org.toshi&hl=en_CA"
        target="_blank"
        rel="noopener noreferrer"
        title="Download Coinbase Wallet from Google Play Store">
        <img src={PlayStoreButtonImg} alt="Google Play Store Button" width="120" />
      </a>

    const iOSLink = <a
        href="https://itunes.apple.com/us/app/coinbase-wallet/id1278383455?mt=8"
        target="_blank"
        rel="noopener noreferrer"
        title="Download Coinbase Wallet from Apple App Store">
        <img src={AppStoreButtonImg} alt="Apple App Store Button" width="120" />
      </a>

    const link = getMobileOperatingSystem() === 'iOS' ? iOSLink : androidLink

    return (
      <Modal show={isVisible}>
        <Modal.Header>
          <div className="row">
            <div className="col-xs-12 text-center">
              <h4>
                Unsupported Browser
              </h4>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p>
              You are using an unsupported mobile DApp browser which has many bugs which will affect your Hippocrates experience.
            </p>
            <p>
              We recommend using the Coinbase Wallet DApp browser:
            </p>
            <br />
            {link}
            <br />
            <br />
            <hr />
            <br />

            <p>
              <br />
              <a onClick={this.handleCloseModal}>ignore this warning</a>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    )
  }
}
