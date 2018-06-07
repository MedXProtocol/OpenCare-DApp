import React, { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint';
import MainLayout from '../../layouts/MainLayout';
import { formatKey } from '~/services/format-key'
import { signedInSecretKey } from '~/services/sign-in'
import { deriveSharedKey } from '~/services/derive-shared-key'
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
        <div className="container">
          <div className='row'>
            <div className='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2'>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Hippocrates Emergency Kit
                  </h3>
                </div>

                <div className="card-body">

                  <h4>
                    This is your <b>Secret Key</b>
                  </h4>
                  <div className="well" role="alert">
                    <div className='secret-key__key'>
                      {formatKey(secretKey)}
                    </div>
                  </div>

                  <hr />
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

                  <hr />

                  <div className="text-center">
                    <a href='javascript:;' onClick={this.print} className="btn btn-lg btn-success">
                      <FontAwesomeIcon
                        icon={faPrint}
                        size='lg' /> &nbsp;
                      Print
                    </a>
                  </div>
                  <h3 className='text-center'>
                    Or, save this page for your records.
                  </h3>
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
})

export default DiagnoseCase;
