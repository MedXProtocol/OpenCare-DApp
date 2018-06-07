import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { formatKey } from '@/services/format-key'
import { signedInSecretKey } from '@/services/sign-in'
import { deriveSharedKey } from '@/services/derive-shared-key'
import { connect } from 'react-redux'

function mapStateToProps(state) {
  const account = state.sagaGenesis.accounts[0]
  return {
    account
  }
}

const DiagnoseCase = connect(mapStateToProps)(class _DiagnoseCase extends Component {
  print = () => {
    window.print()
  }

  render () {
    const secretKey = signedInSecretKey()

    return (
      <MainLayout>
        <div className='container'>
          <div className='row'>
            <div className='col col-sm-6 col-sm-offset-3'>
              <div className='text-center'>
                <h1>
                  Hippocrates Emergency Kit
                </h1>
                <h3>
                  This is your <b>Secret Key</b>
                </h3>
                <div className="well" role="alert">
                  <div className='secret-key__key'>
                    {formatKey(secretKey)}
                  </div>
                </div>
              </div>
              <h4 className='text-center'>
                To sign in on a new browser:
              </h4>
              <ol>
                <li>Ensure you are using a Web3-enabled browser and that the current account is <b>{this.props.account}</b></li>
                <li>Go to the Hippocrates sign up page: <a href='/sign-up' target='_blank'>/sign-up</a></li>
                <li>Enter the above secret key</li>
                <li>Enter a new master password to encrypt your data locally</li>
                <li>Confirm the master password, then create your account</li>
              </ol>
              <h4 className='text-center'>
                <a href='javascript:;' onClick={this.print}><b>Print</b></a> or save this page for your records.
              </h4>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
})

export default DiagnoseCase;
