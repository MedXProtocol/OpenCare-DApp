import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import { HelpBlock } from 'react-bootstrap'
import { formatKey } from '@/services/format-key'
import { isAccountMasterPassword } from '@/services/is-account-master-password'
import { connect } from 'react-redux'

const HIDDEN_KEY = formatKey(Array(33).join('X'))

function mapStateToProps(state, ownProps) {
  return {
    overrideError: state.account.overrideError,
    secretKeyError: state.account.secretKeyError,
    masterPasswordError: state.account.masterPasswordError
  }
}

function mapDispatchToProps(dispatch) {
  return {
    clearOverrideError: () => {
      dispatch({ type: 'SIGN_IN_RESET_OVERRIDE' })
    }
  }
}

export const SignInForm = connect(mapStateToProps, mapDispatchToProps)(class _SignInForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: '',
      masterPassword: '',
      showOverrideModal: false
    }
  }

  onChangeSecretKey = (e) => {
    this.setState({secretKey: formatKey(e.target.value)})
  }

  onSubmit = (e) => {
    if (e) e.preventDefault()
    this.doSubmit()
  }

  doSubmit = (overrideAccount) => {
    var strippedSecretKey = this.state.secretKey.replace(/[^\w]/g, '')
    this.props.onSubmit({ secretKey: strippedSecretKey, masterPassword: this.state.masterPassword, overrideAccount })
  }

  render () {
    var masterPasswordError
    if (this.props.masterPasswordError) {
      masterPasswordError = <Alert bsStyle='danger'>{this.props.masterPasswordError}</Alert>
    }

    var secretKeyError
    if (this.props.secretKeyError) {
      secretKeyError = <Alert bsStyle='danger'>{this.props.secretKeyError}</Alert>
    }

    if (this.props.hasAccount) {
      var existingSecretKey =
        <HelpBlock>Leave blank to use your secret key on file</HelpBlock>
    }

    return (
      <form onSubmit={this.onSubmit} autoComplete='off'>
        <Modal show={this.props.overrideError}>
            <Modal.Body>
                <div className="row">
                    <div className="col text-center">
                        <h3 className='warning'>
                          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                          Warning
                        </h3>
                        <p>
                          By entering a new secret key you are about to overwrite an existing secret key for this address.  You will lose access to any cases that have been encrypted using your existing secret key.
                        </p>
                        <p>
                          You can find your existing secret key in your <b>Emergency Kit</b>.  Your emergency kit is available under the profile menu when you are signed in.
                        </p>
                        <p className='lead'>Are you sure you want to continue?</p>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
              <button onClick={() => this.props.clearOverrideError()} className="btn btn-default">Cancel</button>
              <button onClick={() => this.doSubmit(true)} className="btn btn-default">Continue</button>
            </Modal.Footer>
        </Modal>
        <div className='form-group'>
          <label htmlFor="secretKey">Secret Key</label>
          <input
            value={this.state.secretKey}
            autoComplete="off"
            onChange={this.onChangeSecretKey}
            placeholder={HIDDEN_KEY}
            type="text" className="form-control"
            name='secret-key'
            minLength='39'
            maxLength='39' />
          {existingSecretKey}
          {secretKeyError}
        </div>
        <div className='form-group'>
          <label htmlFor="masterPassword">Master Password</label>
          <input
            value={this.state.masterPassword}
            onChange={(e) => this.setState({masterPassword: e.target.value})}
            type="password" className="form-control" />
          {masterPasswordError}
        </div>
        {this.props.children}
      </form>
    )
  }
})

SignInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hasAccount: PropTypes.bool,
  masterPasswordError: PropTypes.string,
  secretKeyError: PropTypes.string
}
