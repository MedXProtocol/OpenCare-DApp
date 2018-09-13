import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Alert, Button } from 'react-bootstrap'
import get from 'lodash.get'
import { all } from 'redux-saga/effects'
import { cacheCall, cacheCallValue, contractByName, withSaga } from '~/saga-genesis'
import { mixpanel } from '~/mixpanel'
import { toastr } from '~/toastr'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { currentAccount, signIn } from '~/services/sign-in'
import { Account } from '~/accounts/Account'
import * as routes from '~/config/routes'
import { PageTitle } from '~/components/PageTitle'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const isDermatologist = cacheCallValue(state, DoctorManager, 'isDermatologist', address)
  return {
    DoctorManager,
    isDermatologist,
    isDoctor
  }
}


function* saga({ address, DoctorManager }) {
  if (!address || !DoctorManager) { return }
  yield all([
    cacheCall(DoctorManager, 'isDoctor', address),
    cacheCall(DoctorManager, 'isDermatologist', address)
  ])
}

export const ChangePassword = withSaga(saga)(
  class _ChangePassword extends Component {
    constructor (props) {
      super(props)
      this.state = {
        currentMasterPassword: '',
        newMasterPassword: '',
        confirmNewMasterPassword: ''
      }
    }

    onSubmit = (e) => {
      e.preventDefault()

      this.setState({
        successMsg: '',
        currentPasswordError: '',
        matchPasswordError: ''
      }, this.doChange)
    }

    doChange = async () => {
      let currentPasswordError = ''
      let matchPasswordError = masterPasswordInvalid(this.state.newMasterPassword)
      let account = currentAccount()

      let isMasterPassword = await account.isMasterPassword(this.state.currentMasterPassword)
      if (!isMasterPassword) {
        currentPasswordError = 'The current Master Password you have entered is incorrect'
      } else if (this.state.newMasterPassword !== this.state.confirmNewMasterPassword) {
        matchPasswordError = 'Both passwords must match'
      }

      if (currentPasswordError || matchPasswordError) {
        this.setState({
          currentPasswordError,
          matchPasswordError
        })
        mixpanel.track("Change Password Attempt")
      } else {
        this.onNewMasterPassword(account)
      }
    }

    onNewMasterPassword = async (account) => {
      let dynamicNextPath = (this.props.isDoctor && this.props.isDermatologist)
        ? routes.DOCTORS_CASES_OPEN
        : routes.PATIENTS_CASES
      let newAccount = await Account.create({
        networkId: account.networkId(),
        address: account.address(),
        secretKey: account.secretKey(),
        masterPassword: this.state.newMasterPassword
      })
      signIn(newAccount)

      mixpanel.track("Change Password")

      toastr.success('Your Master Password for this account has been changed.')
      this.props.history.push(dynamicNextPath)
    }

    render() {
      const {
        currentPasswordError,
        matchPasswordError,
        successMsg,
        currentMasterPassword,
        newMasterPassword,
        confirmNewMasterPassword
      } = this.state

      if (currentPasswordError) {
        var currentError = <Alert className='text-center' bsStyle='danger'>{currentPasswordError}</Alert>
      }
      if (matchPasswordError) {
        var matchError = <Alert className='text-center' bsStyle='danger'>{matchPasswordError}</Alert>
      }
      if (successMsg) {
        var success = <Alert className='text-center' bsStyle='success'>{successMsg}</Alert>
      }

      return (
        <div>
          <PageTitle renderTitle={(t) => t('pageTitles.changePassword')} />
          <div className='container'>
            <div className="row">
              <div className="col-sm-6 col-sm-offset-3">
                <div className="card">
                  <div className="card-header">
                    <h3 className="title card-title">
                      <span className="title">Change Your Master Password</span>
                    </h3>
                  </div>
                  <form onSubmit={this.onSubmit}>
                    <div className="card-body">
                      <p className='text-gray'>
                        This password is combined with your Secret Key to sign in. To retrieve your Secret Key, visit your <Link to={routes.ACCOUNT_EMERGENCY_KIT}>Emergency Kit</Link>.
                      </p>

                      {success}

                      <br />

                      <div className="form-wrapper">
                        <div className='form-group'>
                          <label>Current Master Password:</label>
                          <input
                            type="password"
                            value={currentMasterPassword}
                            onChange={(event) => this.setState({ currentMasterPassword: event.target.value })}
                            className="form-control input-lg"
                            placeholder="********" />
                          {currentError}
                        </div>

                        <hr />

                        <div className='form-group'>
                          <label>New Master Password:</label>
                          <input
                            type="password"
                            value={newMasterPassword}
                            onChange={(event) => this.setState({ newMasterPassword: event.target.value })}
                            className="form-control input-lg"
                            placeholder="********" />
                          {matchError}
                        </div>

                        <div className='form-group'>
                          <label>Confirm New Master Password:</label>
                          <input
                            type="password"
                            value={confirmNewMasterPassword}
                            onChange={(event) => this.setState({ confirmNewMasterPassword: event.target.value })}
                            className="form-control input-lg"
                            placeholder="********" />
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className='text-right'>
                        <Button
                          bsStyle='success'
                          type='submit'
                          className='btn-lg'>
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
)

export const ChangePasswordContainer = connect(mapStateToProps)(ChangePassword)
