import React, { Component } from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { formatSecretKey } from '~/services/format-secret-key'
import { currentAccount } from '~/services/sign-in'
import { EthAddress } from '~/components/EthAddress'
import { PrintCopySecretKey } from '~/components/PrintCopySecretKey'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let address = get(state, 'sagaGenesis.accounts[0]')

  return {
    address
  }
}

export const EmergencyKitDisplay = class _EmergencyKitDisplay extends Component {
  render () {
    const secretKey = currentAccount().secretKey()

    return (
      <div className='container'>
        <div className='row'>
          <div className='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2'>
            <div className="card">
              <div className="card-header">
                <h3 className="title card-title">
                  DermX Emergency Kit
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

                <br />

                <PrintCopySecretKey
                  secretKey={secretKey}
                  address={this.props.address}
                />

                <br />
                <br />

                <p className="title text-center">
                  To sign in on a new browser:
                </p>
                <ol>
                  <li>Ensure you are using a Web3-enabled browser and that the current account is <b>{this.props.account}</b></li>
                  <li>Go to the DermX sign up page: <a href={routes.SIGN_UP} target='_blank' rel="noopener noreferrer">/sign-up</a></li>
                  <li>Enter the above secret key</li>
                  <li>Enter a new master password to encrypt your data locally</li>
                  <li>Confirm the master password, then create your account</li>
                </ol>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const EmergencyKitDisplayContainer = connect(mapStateToProps)(EmergencyKitDisplay)
