import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout';
import { genKey } from '@/services/gen-key'
import { Redirect } from 'react-router-dom'

import { ConfirmCreate } from './confirm-create'
import { SecretKey } from './secret-key'
import { MasterPassword } from './master-password'
import { setupAccount } from '@/services/setup-account'
import { getAccount } from '@/services/get-account'
import { signIn } from '@/services/sign-in'

export class CreateAccount extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: genKey(16).toUpperCase(),
      showMasterPassword: false,
      showConfirm: false,
      redirect: false
    }
  }

  onMasterPassword = (password) => {
    setupAccount(this.state.secretKey, password)
    this.setState({showConfirm: true})
  }

  onConfirm = ({ secretKey, masterPassword }) => {
    signIn(getAccount(), masterPassword)
    this.setState({ redirect: true })
  }

  render () {
    var content
    if (this.state.redirect) {
      content = <Redirect to='/' />
    } else if (this.state.showConfirm) {
      content = <ConfirmCreate onConfirm={this.onConfirm} account={getAccount()}/>
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
}
