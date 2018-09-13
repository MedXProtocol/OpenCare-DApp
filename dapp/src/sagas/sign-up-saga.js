import { put, call, takeEvery, select } from 'redux-saga/effects'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { Account } from '~/accounts/Account'
import { mixpanel } from '~/mixpanel'
import { contractByName, web3Call } from '~/saga-genesis'

export function* signUpSaga({ networkId, address, secretKey, masterPassword, overrideAccount }) {
  yield put({ type: 'SIGNING_IN' })

  if (!networkId || !address) {
    yield put({ type: 'SIGN_IN_ERROR', missingCredentialsError: 'Ethereum Address and/or Network ID is missing' })
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
