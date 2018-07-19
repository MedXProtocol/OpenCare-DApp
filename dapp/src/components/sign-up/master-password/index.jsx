import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { Alert } from 'react-bootstrap'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { BodyClass } from '~/components/BodyClass'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTopOnMount } from '~/components/ScrollToTopOnMount'
import PropTypes from 'prop-types'

export const MasterPassword = class _MasterPassword extends Component {
  static propTypes = {
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
    let error = masterPasswordInvalid(this.state.masterPassword)
    if (this.state.masterPassword !== this.state.confirmMasterPassword) {
      error = 'Both passwords must match'
    }
    if (!error) {
      this.props.onMasterPassword(this.state.masterPassword)
    } else {
      this.setState({
        error
      })
    }
  }

  render () {
    if (this.state.error) {
      var error = <Alert className='text-center' bsStyle='danger'>{this.state.error}</Alert>
    }
    return (
      <BodyClass isDark={true}>
        <ScrollToTopOnMount />
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
                      placeholder="Enter a password" />
                    {error}
                  </div>

                  <div className='form-group'>
                    <label>Confirm Password:</label>
                    <input
                      type="password"
                      value={this.state.confirmMasterPassword}
                      onChange={(event) => this.setState({ confirmMasterPassword: event.target.value })}
                      className="form-control input-lg"
                      placeholder="Enter password again" />
                  </div>
                </div>

                <div className="form-wrapper--footer text-right">
                  <LoadingLines visible={this.props.creating} /> &nbsp;
                  <input
                    disabled={this.props.creating}
                    type='submit'
                    value={this.props.creating ? 'Creating Account ...' : 'Create Account'}
                    className='btn btn-lg btn-primary' />
                </div>
              </div>
            </div>
          </form>
        </div>
      </BodyClass>
    )
  }
}

export const MasterPasswordContainer = ReactTimeout(MasterPassword)
