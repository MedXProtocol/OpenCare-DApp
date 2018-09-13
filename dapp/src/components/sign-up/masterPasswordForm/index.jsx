import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { BodyClass } from '~/components/BodyClass'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTop } from '~/components/ScrollToTop'
import PropTypes from 'prop-types'

export const MasterPasswordForm = class _MasterPassword extends Component {
  static propTypes = {
    masterPasswordError: PropTypes.string,
    missingCredentialsError: PropTypes.string,
    onMasterPassword: PropTypes.func.isRequired,
    creating: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      masterPassword: '',
      confirmMasterPassword: ''
    }
  }

  onSubmit = (e) => {
    e.preventDefault()

    if (this.state.masterPassword !== this.state.confirmMasterPassword) {
      this.setState({ errorMessage: 'Both passwords must match' })
    } else {
      this.setState({ errorMessage: null }, () => {
        this.props.onMasterPassword(this.state.masterPassword)
      })
    }
  }

  render () {
    var errorMessage = this.state.errorMessage || this.props.masterPasswordError || this.props.missingCredentialsError
    if (errorMessage) {
      var errorAlert = <Alert className='text-center' bsStyle='danger'>
        {errorMessage}
      </Alert>
    }
    return (
      <BodyClass isDark={true}>
        <ScrollToTop />
        <div className='container'>
          <form className='row' onSubmit={this.onSubmit}>
            <div className='col-sm-8 col-sm-offset-2'>
              <h3 className='text-center text-white title--inverse'>
                Create your <b>Master Password</b>
              </h3>
              <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                <div className="form-wrapper--body">
                  <p className='text-gray'>
                    You will use this password combined with your secret key to sign in.
                  </p>

                  <div className='form-group'>
                    <label>Password:</label>
                    <input
                      type="password"
                      value={this.state.masterPassword}
                      onChange={(event) => this.setState({ masterPassword: event.target.value })}
                      className="form-control input-lg"
                      autoFocus={true}
                      placeholder="Enter a password"
                    />
                    {errorAlert}
                  </div>

                  <div className='form-group'>
                    <label>Confirm Password:</label>
                    <input
                      type="password"
                      value={this.state.confirmMasterPassword}
                      onChange={(event) => this.setState({ confirmMasterPassword: event.target.value })}
                      className="form-control input-lg"
                      placeholder="Enter password again"
                    />
                  </div>
                </div>

                <div className="form-wrapper--footer text-right">
                  <LoadingLines visible={this.props.creating} /> &nbsp;
                  <input
                    disabled={this.props.creating}
                    type='submit'
                    value={this.props.creating ? 'Creating Account ...' : 'Create Account'}
                    className='btn btn-lg btn-primary'
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </BodyClass>
    )
  }
}
