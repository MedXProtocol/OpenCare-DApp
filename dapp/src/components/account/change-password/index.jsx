import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Alert, Button } from 'react-bootstrap'
import get from 'lodash.get'
import { mixpanel } from '~/mixpanel'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { Account } from '~/accounts/Account'
import { MainLayoutContainer } from '~/layouts/MainLayout'

function mapStateToProps(state, ownProps) {
  let address = get(state, 'sagaGenesis.accounts[0]')
  return {
    account: Account.get(address)
  }
}

export const ChangePassword = class extends Component {
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

  doChange = () => {
    let currentPasswordError = ''
    let matchPasswordError = masterPasswordInvalid(this.state.newMasterPassword)

    if (!this.props.account.isMasterPassword(this.state.currentMasterPassword)) {
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
      this.onNewMasterPassword()
    }
  }

  onNewMasterPassword = () => {
    Account.updateMasterPassword({
      account: this.props.account,
      currentMasterPassword: this.state.currentMasterPassword,
      newMasterPassword: this.state.newMasterPassword
    })

    this.setState({
      currentMasterPassword: '',
      newMasterPassword: '',
      confirmNewMasterPassword: '',
      successMsg: 'Your Master Password for this account has been changed.'
    })

    mixpanel.track("Change Password")
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
      <MainLayoutContainer>
        <div className="container">
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    <span className="title">Change Your Master Password</span>
                  </h4>
                </div>
                <div className="card-body">
                  <p className='text-gray'>
                    This password is combined with your Secret Key to sign in. To retrieve your Secret Key, visit your <Link to='/account/emergency-kit'>Emergency Kit</Link>.
                  </p>

                  {success}

                  <br />

                  <form onSubmit={this.onSubmit}>
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
                          autoFocus={true}
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

                    <div className='text-right'>
                      <Button
                        bsStyle='success'
                        type='submit'
                        className='btn-lg'>
                        Change Password
                      </Button>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    )
  }
}


export const ChangePasswordContainer = connect(mapStateToProps)(ChangePassword)
