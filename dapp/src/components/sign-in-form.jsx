import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import { HelpBlock } from 'react-bootstrap'
import { formatKey } from '~/services/format-key'
import { isAccountMasterPassword } from '~/services/is-account-master-password'
import { connect } from 'react-redux'
import { OverrideModal } from '~/components/override-modal'

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
      <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
        <form onSubmit={this.onSubmit} autoComplete='off'>
          <div className="form-wrapper--body">
            <OverrideModal
              show={this.props.overrideError}
              onCancel={this.props.clearOverrideError}
              onConfirm={() => this.doSubmit(true)} />
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
                type="password"
                className="form-control"
                autoFocus={true} />
              {masterPasswordError}
            </div>
            {this.props.children}
          </div>
          <div className="form-wrapper--footer">
            <div className='text-right'>
              <input type='submit' value='Sign In' className='btn btn-lg btn-primary' />
            </div>
          </div>
        </form>
      </div>
    )
  }
})

SignInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hasAccount: PropTypes.bool,
  masterPasswordError: PropTypes.string,
  secretKeyError: PropTypes.string
}
