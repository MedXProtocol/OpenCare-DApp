import React, { Component } from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint'
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { formatSecretKey } from '~/services/format-secret-key'
import { currentAccount } from '~/services/sign-in'
import { EthAddress } from '~/components/EthAddress'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let address = get(state, 'sagaGenesis.accounts[0]')

  return {
    address
  }
}

export const EmergencyKitDisplay = class extends Component {
  handlePrint = (e) => {
    e.preventDefault()
    window.print()
  }

  handleEmail = (e) => {
    e.preventDefault()

    let subject = 'Important! Hippocrates Secret Key -- KEEP THIS SAFE!'
    let body    = `Dear Hippocrates user,%0A%0AYour secret key data is encrypted and stored safe using this secret key:%0A%0A${formatSecretKey(currentAccount().secretKey())}%0A%0AFor ETH address: ${this.props.address}%0A%0A%0AKeep this somewhere safe and secure, and use it to log in to Hippocrates from any other browser.%0A%0AThanks for using Hippocrates!%0A- The MedCredits Team`

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank', 'noopener');
  }

  render () {
    const secretKey = currentAccount().secretKey()

    return (
      <MainLayoutContainer>
        <div className="container">
          <div className='row'>
            <div className='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2'>
              <div className="card">
                <div className="card-header">
                  <h3 className="title card-title">
                    Hippocrates Emergency Kit
                  </h3>
                </div>

                <div className="card-body">
                  <h4>
                    This is your <b>Secret Key</b>
                  </h4>
                  <div className="well" role="alert">
                    <div className='secret-key__key'>
                      {formatSecretKey(secretKey)}
                    </div>
                  </div>
                  <p className="small text-center">
                    <span className="eth-address text-gray">ethereum address:&nbsp;
                      <EthAddress address={this.props.address} showFull={true} />
                    </span>
                  </p>

                  <div className="visible-sm visible-md visible-lg">
                    <div className="text-center">
                      <a onClick={this.handlePrint} className="btn btn-lg btn-success">
                        <FontAwesomeIcon
                          icon={faPrint}
                          size='lg' /> &nbsp;
                        Print or save as PDF
                      </a>
                    </div>
                  </div>
                  <div className="visible-xs">
                    <div className="text-center">
                      <a onClick={this.handleEmail} className="btn btn-success">
                        <FontAwesomeIcon
                          icon={faEnvelope} />&nbsp;
                        Send Key To Your Email
                      </a>
                    </div>
                  </div>

                  <hr />

                  <p className="title">
                    To sign in on a new browser:
                  </p>
                  <ol>
                    <li>Ensure you are using a Web3-enabled browser and that the current account is <b>{this.props.account}</b></li>
                    <li>Go to the Hippocrates sign up page: <a href={routes.SIGN_UP} target='_blank' rel="noopener noreferrer">/sign-up</a></li>
                    <li>Enter the above secret key</li>
                    <li>Enter a new master password to encrypt your data locally</li>
                    <li>Confirm the master password, then create your account</li>
                  </ol>

                  <hr />


                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    );
  }
}

export const EmergencyKitDisplayContainer = connect(mapStateToProps)(EmergencyKitDisplay)
