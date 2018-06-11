import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Alert, Button } from 'react-bootstrap'
import get from 'lodash.get'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint';
import MainLayout from '~/layouts/MainLayout';
import { EmergencyKitDisplay } from './EmergencyKitDisplay'
import { getAccount } from '~/services/get-account'

function mapStateToProps(state, ownProps) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  return {
    masterPasswordError: state.account.masterPasswordError,
    masterPasswordOk: state.account.masterPasswordOk,
    address,
    account: getAccount(address)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    checkMasterPassword: ({ masterPassword, account, address }) => {
      dispatch({ type: 'MASTER_PASSWORD_CHECK', masterPassword, account, address })
    },
    resetMasterPasswordCheck: () => {
      dispatch({ type: 'MASTER_PASSWORD_RESET' })
    },
  }
}

const EmergencyKit = connect(mapStateToProps, mapDispatchToProps)(class _EmergencyKit extends Component {
  constructor (props) {
    super(props)

    this.state = {
      masterPassword: ''
    }
  }

  componentWillUnmount() {
    this.props.resetMasterPasswordCheck()
  }

  handleSubmit = (e) => {
    if (e) e.preventDefault()

    this.props.checkMasterPassword({
      masterPassword: this.state.masterPassword,
      account: this.props.account,
      address: this.props.address
    })
  }

  render () {
    let emergencyKit = null

    if (this.props.masterPasswordOk) {
      emergencyKit = <EmergencyKitDisplay />
    }
    else {
      let masterPasswordError
      if (this.props.masterPasswordError) {
        masterPasswordError = <Alert bsStyle='danger'>{this.props.masterPasswordError}</Alert>
      }
      emergencyKit = (
        <MainLayout>
          <div className="container">
            <div className='row'>
              <div className='col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2'>
                <div className="card">

                  <form onSubmit={this.handleSubmit} autoComplete='off'>
                    <div className="card-header">
                      <h3 className="card-title">
                        Hippocrates Emergency Kit
                      </h3>
                    </div>

                    <div className="card-body">
                      <div className='form-group'>
                        <label htmlFor="masterPassword">
                          Master Password
                        </label>
                        <input
                          value={this.state.masterPassword}
                          onChange={(e) => this.setState({ masterPassword: e.target.value })}
                          type="password"
                          className="form-control" />
                        {masterPasswordError}
                      </div>
                    </div>

                    <div className="form-wrapper--footer">
                      <div className='text-right'>
                        <Button
                          bsStyle='success'
                          type='submit'
                          className='btn-lg'>
                          Unlock
                        </Button>
                      </div>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      )
    }

    return emergencyKit
  }
})

export { EmergencyKit }
