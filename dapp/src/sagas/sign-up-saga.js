import { put, call, takeEvery, select } from 'redux-saga/effects'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { upgradeOldAccount } from '~/services/upgradeOldAccount'
import { Account } from '~/accounts/Account'
import { mixpanel } from '~/mixpanel'
import { contractByName, web3Call } from '~/saga-genesis'

export function* signUpSaga({ networkId, address, secretKey, masterPassword, overrideAccount }) {
  console.log(networkId, address)
  if (networkId && address) {
    upgradeOldAccount(networkId, address)
  }

  if (!address) {
    yield put({ type: 'SIGN_IN_ERROR', addressError: 'Address is not defined' })
    return
  }
  var masterPasswordError = masterPasswordInvalid(masterPassword)
  if (masterPasswordError) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError })
    return
  }

  let account = Account.get(networkId, address)
  let newAccount = yield call([Account, 'build'], { networkId, address, secretKey, masterPassword })
  let differentAccountExists = false

  if (account && (account.hashedSecretKey !== newAccount.hashedSecretKey)) {
    differentAccountExists = true
  } else {
    const AccountManager = yield select(contractByName, 'AccountManager')
    let existingPublicKey = yield web3Call(AccountManager, 'publicKeys', address)
    let expectedPublicKey = '0x' + newAccount.hexPublicKey()
    differentAccountExists = existingPublicKey && existingPublicKey !== expectedPublicKey
  }

  if (differentAccountExists && !overrideAccount) {
    console.log('hello')
    yield put({ type: 'SIGN_IN_ERROR', overrideError: true })
  } else {
    const account = yield call(Account.create, { networkId, address, secretKey, masterPassword })
    yield put({ type: 'SIGN_IN_OK', account, masterPassword, address })
    mixpanel.track("Signup")
  }
}

export default function* rootSaga() {
  yield takeEvery('SIGN_UP', signUpSaga)
}
