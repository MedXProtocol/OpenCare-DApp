import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Alert, HelpBlock } from 'react-bootstrap'
import { formatSecretKey } from '~/services/format-secret-key'
import { connect } from 'react-redux'
import { LoadingLines } from '~/components/LoadingLines'
import { OverrideDisallowedModal } from '~/components/OverrideDisallowedModal'
import get from 'lodash.get'

const HIDDEN_KEY = formatSecretKey(Array(65).join('X'))

function mapStateToProps(state, ownProps) {
  const signingIn = get(state, 'account.signingIn')

  return {
    signingIn,
    overrideError: state.account.overrideError,
    secretKeyError: state.account.secretKeyError,
    publicKeyMismatchError: state.account.publicKeyMismatchError,
    masterPasswordError: state.account.masterPasswordError,
    missingCredentialsError: state.account.missingCredentialsError
  }
}

function mapDispatchToProps(dispatch) {
  return {
    clearOverrideError: () => {
      dispatch({ type: 'SIGN_IN_RESET_OVERRIDE' })
    }
  }
}

export const SignInForm = class _SignInForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: '',
      masterPassword: '',
      showOverrideModal: false
    }
  }

  onChangeSecretKey = (e) => {
    this.setState({secretKey: formatSecretKey(e.target.value)})
  }

  onSubmit = (e) => {
    if (e) e.preventDefault()
    this.doSubmit()
  }

  doSubmit = (overrideAccount) => {
    var strippedSecretKey = this.state.secretKey.replace(/[^\w]/g, '')
    this.props.onSubmit({
      secretKey: strippedSecretKey,
      masterPassword: this.state.masterPassword,
      overrideAccount
    })
  }

  render () {
    const {
      signingIn,
      masterPasswordError,
      secretKeyError,
      publicKeyMismatchError,
      missingCredentialsError
    } = this.props

    if (masterPasswordError) {
      var passwordError = <Alert bsStyle='danger'>{masterPasswordError}</Alert>
    }

    if (secretKeyError || publicKeyMismatchError || missingCredentialsError) {
      var errorAlert = <Alert bsStyle='danger'>
        {secretKeyError || publicKeyMismatchError || missingCredentialsError}
      </Alert>
    }

    if (this.props.hasAccount) {
      var leaveBlankMsg = <HelpBlock>Leave blank to use your secret key on file</HelpBlock>
    }

    return (
      <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
        <form onSubmit={this.onSubmit} autoComplete='off'>
          <div className="form-wrapper--body">
            <OverrideDisallowedModal
              show={!!this.props.overrideError}
              onOk={this.props.clearOverrideError} />
            <div className='form-group'>
              <label htmlFor="secretKey">Secret Key</label>
              <input
                value={this.state.secretKey}
                autoComplete="off"
                onChange={this.onChangeSecretKey}
                placeholder={HIDDEN_KEY}
                type="text"
                className="form-control input-lg"
                name='secret-key'
                minLength='79'
                maxLength='79' />
              {leaveBlankMsg}
              {errorAlert}
            </div>
            <div className='form-group'>
              <label htmlFor="masterPassword">Master Password</label>
              <input
                value={this.state.masterPassword}
                onChange={(e) => this.setState({ masterPassword: e.target.value })}
                type="password"
                className="form-control input-lg"
                autoFocus={true} />
              {passwordError}
            </div>
          </div>
          <div className="form-wrapper--footer">
            <div className='text-right'>
              <LoadingLines visible={signingIn} /> &nbsp;
              <input
                disabled={signingIn}
                type='submit'
                value={signingIn ? 'Signing In ...' : 'Sign In'}
                className='btn btn-lg btn-primary' />
            </div>
          </div>
        </form>
      </div>
    )
  }
}

export const SignInFormContainer = connect(mapStateToProps, mapDispatchToProps)(SignInForm)

SignInFormContainer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hasAccount: PropTypes.bool,
  masterPasswordError: PropTypes.string,
  secretKeyError: PropTypes.string,
  publicKeyMismatchError: PropTypes.string,
  missingCredentialsError: PropTypes.string
}
