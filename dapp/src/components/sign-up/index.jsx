import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Account } from '~/accounts/Account'
import { upgradeOldAccount } from '~/services/upgradeOldAccount'
import { genKey } from '~/services/gen-key'
import { mixpanel } from '~/mixpanel'
import { OverrideDisallowedModal } from '~/components/OverrideDisallowedModal'
import { MasterPasswordContainer } from './master-password'
import { SecretKeyContainer } from './secret-key'
import { contractByName, cacheCall, cacheCallValue, withSaga } from '~/saga-genesis'
import { PageTitle } from '~/components/PageTitle'
import get from 'lodash.get'

function mapStateToProps(state) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  if (!networkId) { return {} }
  const address = get(state, 'sagaGenesis.accounts[0]')
  const account = Account.get(networkId, address)
  const signedIn = state.account.signedIn
  const overrideError = state.account.overrideError
  const AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', address)

  return {
    networkId,
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
    signUp: ({ networkId, address, secretKey, masterPassword, overrideAccount }) => {
      dispatch({ type: 'SIGN_UP', networkId, address, secretKey, masterPassword, overrideAccount })
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
      showOverrideModal: false,
      overrideModalHasBeenShown: false,
      creating: false
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.init(nextProps)
  }

  init(props) {
    console.log(props.networkId, props.address)
    if (!props.networkId || !props.address) { return }

    let account = props.account
    console.log(account)
    account = upgradeOldAccount(props.networkId, props.address)

    console.log(account)
    console.log(props.publicKey)

    if (!this.state.overrideModalHasBeenShown && (account || props.publicKey)) {
      this.setState({
        showOverrideModal: true,
        overrideModalHasBeenShown: true
      })
    }
  }

  closeOverrideModal = () => {
    this.setState({
      showOverrideModal: false,
      creating: false
    })
    this.props.clearOverrideError()
  }

  onMasterPassword = (password) => {
    this.setState({
      masterPassword: password,
      creating: true
    }, () => {
      this.props.setTimeout(() => {
        this.props.signUp({
          networkId: this.props.networkId,
          secretKey: this.state.secretKey,
          masterPassword: this.state.masterPassword,
          address: this.props.address
        })
      }, 100)
    })

    mixpanel.track("Signup Attempt")
  }

  render () {
    if (!this.props.networkId) { return null }

    var content
    if (this.props.signedIn) {
      content = <Redirect to='/patients/cases' />
    } else if (this.state.showMasterPassword) {
      content = <MasterPasswordContainer
        onMasterPassword={this.onMasterPassword}
        creating={this.state.creating}
      />
    } else {
      content = <SecretKeyContainer secretKey={this.state.secretKey} onContinue={() => this.setState({showMasterPassword: true})} />
    }
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.signUp')} />
        {content}
        <OverrideDisallowedModal
          show={this.state.showOverrideModal || !!this.props.overrideError}
          onOk={this.closeOverrideModal} />
      </div>
    )
  }
}

export const SignUpContainer = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga)(SignUp)))
