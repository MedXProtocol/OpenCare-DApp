import { put, fork, call, takeEvery, select } from 'redux-saga/effects'
import { isAccountMasterPassword } from '@/services/is-account-master-password'
import { decryptSecretKey } from '@/services/decrypt-secret-key'
import { createCall } from '@/saga-genesis/utils'
import { web3Send, cacheCall } from '@/saga-genesis/sagas'
import { contractByName } from '@/saga-genesis/state-finders'
import { deriveKeyPair } from '@/services/derive-key-pair'
import {
  signIn
} from '@/services/sign-in'

// Here the sign in should perform the check
export function* signInSaga({ secretKey, masterPassword, account }) {
  if (secretKey) { //Then we are creating or signing into a new account
    if (account) { // we must warn if an account already exists
      // NOTE: should check if the secret key is different
      yield put({type: 'SIGN_IN_ERROR', overrideError: true })
    } else { // we're creating a new account
      if (!masterPassword) {
        yield put({type: 'SIGN_IN_ERROR', masterPasswordError: 'You must enter a master password' })
      } else {
        // Set the account, ensure blockchain public key matches, and sign in
        yield put({type: 'SIGN_UP', secretKey, masterPassword})
      }
    }
  } else { // We're using the existing account
    if (account) { // Check the existing account
      if (!isAccountMasterPassword(account, masterPassword)) {
        yield put({type: 'SIGN_IN_ERROR', masterPasswordError: 'The master password does not match the account password' })
      } else {
        yield put({type: 'SIGN_IN_OK', account, masterPassword})
      }
    } else { // error! no existing account
      yield put({type: 'SIGN_IN_ERROR', secretKeyError: 'You must pass a secret key'})
    }
  }
}

export function* checkPublicKey(account, masterPassword) {
  const secretKey = yield call(decryptSecretKey, account, masterPassword)
  const AccountManager = yield select(contractByName, 'AccountManager')
  const existingKey = yield cacheCall(AccountManager, 'publicKeys', account.address)

  if (!existingKey) {
    var publicKey = yield call(deriveKeyPair, secretKey)
    publicKey = yield call([publicKey, publicKey.getPublic], true, 'hex')
    yield call(web3Send, { call: createCall(AccountManager, 'setPublicKey', '0x' + publicKey) })
  }
}

export function* signInOkSaga({ account, masterPassword }) {
  signIn(account, masterPassword)
  yield fork(checkPublicKey, account, masterPassword)
  yield put({type: 'SIGNED_IN'})
}

export default function* rootSaga() {
  yield takeEvery('SIGN_IN', signInSaga)
  yield takeEvery('SIGN_IN_OK', signInOkSaga)
}
