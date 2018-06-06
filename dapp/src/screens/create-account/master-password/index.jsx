import React, { Component } from 'react'
import { BodyClass } from '@/components/BodyClass'

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
      <BodyClass isDark={true}>
        <div className='container'>
          <form className='row' onSubmit={this.onSubmit}>
            <div className='col-sm-8 col-sm-offset-2'>
              <h3 className='text-center text-white'>
                Create your <b>Master Password</b>
              </h3>
              <div className="form-wrapper">
                <div className="well" role="alert">
                  <input
                    type="password"
                    value={this.state.masterPassword}
                    onChange={(event) => this.setState({masterPassword: event.target.value})}
                    className="form-control master-password__input"
                    placeholder="Enter a password" />
                </div>
                <p className='text-center'>
                  You will use this password to sign in.
                </p>
                <p className='text-right'>
                  <input type='submit' className='btn btn-lg btn-primary' value='Continue' />
                </p>
              </div>
            </div>
          </form>
        </div>
      </BodyClass>
    )
  }
}
