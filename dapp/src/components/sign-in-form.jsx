import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { formatKey } from '@/services/format-key'
import { getAccount } from '@/services/get-account'
import { isAccountMasterPassword } from '@/services/is-account-master-password'

const HIDDEN_KEY = formatKey(Array(33).join('X'))

export const SignInForm = class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: '',
      masterPassword: ''
    }
  }

  componentDidMount () {
    this.checkSecretKey(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.checkSecretKey(nextProps)
  }

  checkSecretKey (props) {
    if (props.account && !this.state.secretKey) {
      this.setState({
        secretKey: HIDDEN_KEY
      })
    }
  }

  onChangeSecretKey = (e) => {
    this.setState({secretKey: e.target.value})
    this.checkSecretKey(this.props)
  }

  onSubmit = (e) => {
    e.preventDefault()
    if (this.props.account && !isAccountMasterPassword(this.props.account, this.state.masterPassword)) {
      this.setState({masterPasswordError: 'Does not match the master password.'})
    } else {
      this.props.onSubmit(this.state)
    }
  }

  render () {
    var error
    if (this.state.masterPasswordError) {
      error = <div className='alert alert-danger' role='alert'>{this.state.masterPasswordError}</div>
    }

    return (
      <form onSubmit={this.onSubmit}>
        <div className='form-group'>
          <label htmlFor="secretKey">Secret Key</label>
          <input
            value={this.state.secretKey}
            autoComplete="off"
            onChange={this.onChangeSecretKey}
            type="text" className="form-control" id="secretKey" />
        </div>
        <div className='form-group'>
          <label htmlFor="masterPassword">Master Password</label>
          <input
            value={this.state.masterPassword}
            onChange={(e) => this.setState({masterPassword: e.target.value})}
            type="password" className="form-control" id="masterPassword" />
          {error}
        </div>
        {this.props.children}
      </form>
    )
  }
}

SignInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  account: PropTypes.object
}
