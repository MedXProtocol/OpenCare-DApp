import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { genKey } from '~/services/gen-key'
import { Redirect } from 'react-router-dom'

import { OverrideDisallowedModal } from '~/components/OverrideDisallowedModal'
import { mixpanel } from '~/mixpanel'
import { ConfirmCreate } from './confirm-create'
import { SecretKey } from './secret-key'
import { MasterPassword } from './master-password'
import { connect } from 'react-redux'

function mapStateToProps(state) {
  const address = state.sagaGenesis.accounts[0]
  const signedIn = state.account.signedIn
  const overrideError = state.account.overrideError
  return {
    address,
    signedIn,
    overrideError
  }
}

function mapDispatchToProps(dispatch) {
  return {
    signUp: ({ address, secretKey, masterPassword, overrideAccount }) => {
      dispatch({ type: 'SIGN_UP', address, secretKey, masterPassword, overrideAccount })
    },
    clearOverrideError: () => {
      dispatch({ type: 'SIGN_IN_RESET_OVERRIDE' })
    }
  }
}

export const SignUp = class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: genKey(32),
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
      address: this.props.address
    })

    mixpanel.track("Signup Attempt");
  }

  render () {
    var content
    if (this.props.signedIn) {
      content = <Redirect to='/patients/cases' />
    } else if (this.state.showConfirm) {
      content = <ConfirmCreate onConfirm={this.onConfirm} />
    } else if (this.state.showMasterPassword) {
      content = <MasterPassword onMasterPassword={this.onMasterPassword} />
    } else {
      content = <SecretKey secretKey={this.state.secretKey} onContinue={() => this.setState({showMasterPassword: true})} />
    }
    return (
      <MainLayoutContainer>
        {content}
        <OverrideDisallowedModal
          show={!!this.props.overrideError}
          onOk={this.props.clearOverrideError} />
      </MainLayoutContainer>
    )
  }
}

export const SignUpContainer = connect(mapStateToProps, mapDispatchToProps)(SignUp)
