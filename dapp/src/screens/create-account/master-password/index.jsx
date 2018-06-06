import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'
import masterPasswordInvalid from '@/services/master-password-invalid'
import './master-password.css'

export class MasterPassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      masterPassword: ''
    }
  }

  onSubmit = (e) => {
    e.preventDefault()
    var msg = masterPasswordInvalid(this.state.masterPassword)
    if (msg) {
      this.setState({
        error: msg
      })
    } else {
      this.props.onMasterPassword(this.state.masterPassword)
    }
  }

  render () {
    if (this.state.error) {
      var error = <Alert className='text-center' bsStyle='danger'>{this.state.error}</Alert>
    }
    return (
      <div className='container'>
        <form className='row' onSubmit={this.onSubmit}>
          <div className='col-sm-8 col-sm-offset-2'>
            <h1 className='text-center'>
              Create your <b>Master Password</b>
            </h1>
            <div className="well" role="alert">
              <input
                type="password"
                value={this.state.masterPassword}
                onChange={(event) => this.setState({masterPassword: event.target.value})}
                className="form-control master-password__input"
                placeholder="Enter a password" />
            </div>
            {error}
            <p className='text-center'>
              You'll use this password to sign in.
            </p>
            <p className='text-center'>
              <input type='submit' className='btn btn-primary' value='Continue' />
            </p>
          </div>
        </form>
      </div>
    )
  }
}
