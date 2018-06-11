import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Alert, Button } from 'react-bootstrap'
import get from 'lodash.get'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint';
import { getAccount } from '~/services/get-account'
import { isAccountMasterPassword } from '~/services/is-account-master-password'
import MainLayout from '~/layouts/MainLayout';
import { EmergencyKitDisplay } from './EmergencyKitDisplay'

function mapStateToProps(state, ownProps) {
  const account = getAccount(get(state, 'sagaGenesis.accounts[0]'))
  return {
    account: account
  }
}

export const EmergencyKit = connect(mapStateToProps)(
  class _EmergencyKit extends Component {
    constructor (props) {
      super(props)

      this.state = {
        masterPassword: '',
        masterPasswordError: '',
        masterPasswordOk: false,
        isChecking: false
      }
    }

    handleSubmit = (e) => {
      if (e) e.preventDefault()
      this.setState({ isChecking: true }, this.checkMasterPassword)
    }

    checkMasterPassword = () => {
      let error
      let masterPasswordOk = false

      if (!this.state.masterPassword)
        error = 'You must enter a master password'
      else if (isAccountMasterPassword(this.props.account, this.state.masterPassword))
        masterPasswordOk = true
      else
        error = 'The master password does not match the account password'

      this.setState({
        masterPasswordOk: masterPasswordOk,
        masterPasswordError: error,
        isChecking: false
      })
    }

    render () {
      let emergencyKit = null
      let { masterPasswordError } = this.state
      const { isChecking, masterPasswordOk, masterPassword } = this.state

      if (masterPasswordOk) {
        emergencyKit = <EmergencyKitDisplay />
      }
      else {
        if (masterPasswordError) {
          masterPasswordError = <Alert bsStyle='danger'>{masterPasswordError}</Alert>
        }
        emergencyKit = (
          <MainLayout>
            <div className="container">
              <div className='row'>
                <div className='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2'>
                  <div className="card">

                    <form onSubmit={this.handleSubmit} autoComplete='off'>
                      <div className="card-header">
                        <h3 className="card-title">
                          Hippocrates Emergency Kit
                          <br /><small className="text-gray">To access your secret key, please verify your account by entering your master password:</small>
                        </h3>
                      </div>

                      <div className="card-body">
                        <div className='form-group'>
                          <label htmlFor="masterPassword">
                            Master Password
                          </label>
                          <input
                            value={masterPassword}
                            onChange={(e) => this.setState({ masterPassword: e.target.value })}
                            type="password"
                            className="form-control" />
                          {masterPasswordError}
                        </div>
                      </div>

                      <div className="form-wrapper--footer">
                        <div className='text-right'>
                          <Button
                            bsStyle='success'
                            type='submit'
                            className='btn-lg'
                            disabled={isChecking}>
                            {isChecking ? 'Checking ...' : 'Unlock'}
                          </Button>
                        </div>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </MainLayout>
        )
      }

      return emergencyKit
    }
  }
)
