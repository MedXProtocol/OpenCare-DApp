import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout';
import { genKey } from '@/services/gen-key'
import { Redirect } from 'react-router-dom'

import { ConfirmCreate } from './confirm-create'
import { SecretKey } from './secret-key'
import { MasterPassword } from './master-password'
import { buildAccount } from '@/services/build-account'
import { createAccount } from '@/services/create-account'
import { getAccount } from '@/services/get-account'
import { signIn } from '@/services/sign-in'

export const CreateAccount = class extends Component {
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
    var account = buildAccount(this.state.secretKey, password)
    this.setState({
      showConfirm: true,
      account: account
    })
  }

  onConfirm = ({ secretKey, masterPassword }) => {
    createAccount(this.props.address, this.state.account, this.state.secretKey).then(() => {
      signIn(getAccount(this.props.address), masterPassword).then(() => {
        this.setState({ redirect: true })
      })
    })
  }

  render () {
    var content
    if (this.state.redirect) {
      content = <Redirect to='/' />
    } else if (this.state.showConfirm) {
      content = <ConfirmCreate onConfirm={this.onConfirm} account={this.state.account}/>
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
