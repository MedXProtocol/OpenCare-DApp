import { Component } from 'react'
import { connect } from 'react-redux'
import { currentAccount } from '~/services/sign-in'
import {
  cacheCall,
  cacheCallValue,
  withSaga,
  contractByName
} from '~/saga-genesis'
import { toastr } from '~/toastr'

function mapStateToProps (state) {
  const account = currentAccount()

  if (account === null)
    return {}

  const AccountManager = contractByName(state, 'AccountManager')
  const blockchainPublicKey = cacheCallValue(state, AccountManager, 'publicKeys', account.address())
  const blockchainPublicKeyDefined = !!blockchainPublicKey
  const publicKeyMatches = blockchainPublicKey === '0x' + account.hexPublicKey()
  const destroyAccount = blockchainPublicKeyDefined && !publicKeyMatches

  return {
    account,
    AccountManager,
    destroyAccount
  }
}

function* saga({ account, AccountManager }) {
  if (!account || !AccountManager) { return }

  yield cacheCall(AccountManager, 'publicKeys', account.address())
}

export const PublicKeyListener = connect(mapStateToProps)(
  withSaga(saga)(class _PublicKeyListener extends Component {

    componentWillReceiveProps (nextProps) {
      if (nextProps.destroyAccount) {
        this.props.account.destroy()
        this.props.dispatchSignOut()
        toastr.error('This account has been changed on the blockchain. Please sign in using the correct secret key.')
      }
    }

    render() {
      return null
    }

  })
)
