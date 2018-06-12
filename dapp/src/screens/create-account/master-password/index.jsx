import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'
import { BodyClass } from '~/components/BodyClass'
import masterPasswordInvalid from '~/services/master-password-invalid'

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
      <BodyClass isDark={true}>
        <div className='container'>
          <form className='row' onSubmit={this.onSubmit}>
            <div className='col-sm-6 col-sm-offset-3'>
              <h3 className='text-center text-white'>
                Create your <b>Master Password</b>
              </h3>
              <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                <div className="form-wrapper--body">
                  <p className='text-gray'>
                    You will use this password with your secret key to sign in:
                  </p>

                  <label className="label text-gray">Password:</label>
                  <div className="well" role="alert">
                    <input
                      type="password"
                      value={this.state.masterPassword}
                      onChange={(event) => this.setState({masterPassword: event.target.value})}
                      className="form-control input-lg text-center"
                      placeholder="Enter a password" />
                  </div>
                  {error}
                </div>

                <div className="form-wrapper--footer">
                  <div className='text-right'>
                    <input type='submit' className='btn btn-lg btn-primary' value='Continue' />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </BodyClass>
    )
  }
}
