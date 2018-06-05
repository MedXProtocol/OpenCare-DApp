import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { HelpBlock } from 'react-bootstrap'
import { formatKey } from '@/services/format-key'
import { isAccountMasterPassword } from '@/services/is-account-master-password'
import { connect } from 'react-redux'

const HIDDEN_KEY = formatKey(Array(33).join('X'))

function mapStateToProps(state, ownProps) {
  return {
    secretKeyError: state.account.secretKeyError,
    masterPasswordError: state.account.masterPasswordError
  }
}

export const SignInForm = connect(mapStateToProps)(class _SignInForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: '',
      masterPassword: ''
    }
  }

  onChangeSecretKey = (e) => {
    this.setState({secretKey: formatKey(e.target.value)})
  }

  onSubmit = (e) => {
    e.preventDefault()
    var strippedSecretKey = this.state.secretKey.replace(/[^\w]/g, '')
    this.props.onSubmit({ secretKey: strippedSecretKey, masterPassword: this.state.masterPassword })
  }

  render () {
    var masterPasswordError
    if (this.props.masterPasswordError) {
      masterPasswordError = <div className='alert alert-danger' role='alert'>{this.props.error}</div>
    }

    var secretKeyError
    if (this.props.secretKeyError) {
      secretKeyError = <div className='alert alert-danger' role='alert'>{this.props.secretKeyError}</div>
    }

    if (this.props.hasAccount) {
      var existingSecretKey =
        <HelpBlock>Leave blank to use your secret key on file</HelpBlock>
    }

    return (
      <form onSubmit={this.onSubmit} autoComplete='off'>
        <div className='form-group'>
          <label htmlFor="secretKey">Secret Key</label>
          <input
            value={this.state.secretKey}
            autoComplete="off"
            onChange={this.onChangeSecretKey}
            placeholder={HIDDEN_KEY}
            type="text" className="form-control"
            name='secret-key' />
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
