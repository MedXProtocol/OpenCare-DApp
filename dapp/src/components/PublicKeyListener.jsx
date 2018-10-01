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
import get from 'lodash.get'

function mapStateToProps (state) {
  const account = currentAccount()
  const networkId = get(state, 'sagaGenesis.network.networkId')

  if (account === null)
    return {}

  const AccountManager = contractByName(state, 'AccountManager')
  const blockchainPublicKey = cacheCallValue(state, AccountManager, 'publicKeys', account.address())
  const publicKeyDoesNotMatch = blockchainPublicKey && blockchainPublicKey !== '0x' + account.hexPublicKey()
  const networkMatches = networkId && networkId === account.networkId()
  const destroyAccount = publicKeyDoesNotMatch && networkMatches

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
