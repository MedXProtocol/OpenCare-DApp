import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout';
import { genKey } from '~/services/gen-key'
import { Redirect } from 'react-router-dom'

import { ConfirmCreate } from './confirm-create'
import { SecretKey } from './secret-key'
import { MasterPassword } from './master-password'
import { connect } from 'react-redux'

function mapStateToProps(state) {
  const address = state.sagaGenesis.accounts[0]
  const signedIn = state.account.signedIn
  return {
    address,
    signedIn
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signUp: ({ address, secretKey, masterPassword, overrideAccount }) => {
      dispatch({ type: 'SIGN_UP', address, secretKey, masterPassword, overrideAccount })
    }
  }
}

export const CreateAccount = connect(mapStateToProps, mapDispatchToProps)(class _CreateAccount extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: genKey(16).toUpperCase(),
      showMasterPassword: false,
      showConfirm: false
    }
  }

  onMasterPassword = (password) => {
    this.setState({
      showConfirm: true,
      masterPassword: password
    })
  }

  onConfirm = () => {
    this.props.signUp({
      secretKey: this.state.secretKey,
      masterPassword: this.state.masterPassword,
      address: this.props.address,
      overrideAccount: true
    })
  }

  render () {
    var content
    if (this.props.signedIn) {
      content = <Redirect to='/' />
    } else if (this.state.showConfirm) {
      content = <ConfirmCreate onConfirm={this.onConfirm} />
    } else if (this.state.showMasterPassword) {
      content = <MasterPassword onMasterPassword={this.onMasterPassword} />
    } else {
      content = <SecretKey secretKey={this.state.secretKey} onContinue={() => this.setState({showMasterPassword: true})} />
    }
    return (
      <MainLayout>
        {content}
      </MainLayout>
    )
  }
})
