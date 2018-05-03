import React, { Component } from 'react'

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
    this.props.onMasterPassword(this.state.masterPassword)
  }

  render () {
    return (
      <div className='container'>
        <form className='row' onSubmit={this.onSubmit}>
          <div className='col-sm-8 col-sm-offset-2'>
            <h1 className='text-center'>
              Create your <b>Master Password</b>
            </h1>
            <div className="well" role="alert">
              <input
                value={this.state.masterPassword}
                onChange={(event) => this.setState({masterPassword: event.target.value})}
                type="text"
                className="form-control master-password__input"
                placeholder="Enter a password" />
            </div>
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
