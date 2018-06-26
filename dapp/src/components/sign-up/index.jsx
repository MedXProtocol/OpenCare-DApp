import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Account } from '~/accounts/Account'
import { genKey } from '~/services/gen-key'
import { mixpanel } from '~/mixpanel'
import { ConfirmCreate } from './confirm-create'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { OverrideDisallowedModal } from '~/components/OverrideDisallowedModal'
import { MasterPasswordContainer } from './master-password'
import { SecretKeyContainer } from './secret-key'
import { cacheCall, cacheCallValue, withSaga } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const address = state.sagaGenesis.accounts[0]
  const account = Account.get(address)
  const signedIn = state.account.signedIn
  const overrideError = state.account.overrideError
  const AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', address)
  return {
    address,
    signedIn,
    overrideError,
    account,
    publicKey,
    AccountManager
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

function* saga({ address, AccountManager }) {
  if (!address || !AccountManager) { return }
  yield cacheCall(AccountManager, 'publicKeys', address)
}

export const SignUp = class _SignUp extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: genKey(32),
      showMasterPassword: false,
      showConfirm: false,
      showOverrideModal: false,
      overrideModalHasBeenShown: false
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps (props) {
    this.init(props)
  }

  init(props) {
    if (!this.state.overrideModalHasBeenShown && (props.account || props.publicKey)) {
      this.setState({
        showOverrideModal: true,
        overrideModalHasBeenShown: true
      })
    }
  }

  closeOverrideModal = () => {
    this.setState({ showOverrideModal: false })
    this.props.clearOverrideError()
  }

  onMasterPassword = (password) => {
    this.setState({
      showConfirm: true,
      masterPassword: password
    })
  }

  onConfirm = () => {
    this.setState({
      confirming: true
    }, () => {
      this.props.setTimeout(() => {
        this.props.signUp({
          secretKey: this.state.secretKey,
          masterPassword: this.state.masterPassword,
          address: this.props.address
        })
      }, 100)
    })

    mixpanel.track("Signup Attempt");
  }

  render () {
    var content
    if (this.props.signedIn) {
      content = <Redirect to='/patients/cases' />
    } else if (this.state.showConfirm) {
      content = <ConfirmCreate onConfirm={this.onConfirm} confirming={this.state.confirming} />
    } else if (this.state.showMasterPassword) {
      content = <MasterPasswordContainer onMasterPassword={this.onMasterPassword} />
    } else {
      content = <SecretKeyContainer secretKey={this.state.secretKey} onContinue={() => this.setState({showMasterPassword: true})} />
    }
    return (
      <MainLayoutContainer>
        {content}
        <OverrideDisallowedModal
          show={this.state.showOverrideModal || !!this.props.overrideError}
          onOk={this.closeOverrideModal} />
      </MainLayoutContainer>
    )
  }
}

export const SignUpContainer = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['address', 'AccountManager'] })(SignUp)))
