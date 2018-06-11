import { put, fork, spawn, call, takeEvery, select } from 'redux-saga/effects'
import { isAccountMasterPassword } from '~/services/is-account-master-password'
import decryptSecretKey from '~/services/decrypt-secret-key'
import { createCall } from '~/saga-genesis/utils'
import { cacheCall } from '~/saga-genesis/sagas'
import { contractByName } from '~/saga-genesis/state-finders'
import { deriveKeyPair } from '~/services/derive-key-pair'
import {
  signIn
} from '~/services/sign-in'
import { nextId } from '~/saga-genesis'

// Here the sign in should perform the check
export function* signInSaga({ secretKey, masterPassword, account, address, overrideAccount }) {
  if (!masterPassword) {
    yield put({type: 'SIGN_IN_ERROR', masterPasswordError: 'You must enter a master password' })
    return
  }
  if (secretKey) { //Then we are creating or signing into a new account
    yield put({type: 'SIGN_UP', address, secretKey, masterPassword, overrideAccount})
  } else { // We're using the existing account
    if (account) { // Check the existing account
      if (isAccountMasterPassword(account, masterPassword)) {
        yield put({type: 'SIGN_IN_OK', account, masterPassword, address})
      } else {
        yield put({type: 'SIGN_IN_ERROR', masterPasswordError: 'The master password does not match the account password' })
      }
    } else { // error! no existing account
      yield put({type: 'SIGN_IN_ERROR', secretKeyError: 'You must enter a secret key'})
    }
  }
}

export function* checkPublicKey(account, masterPassword, address) {
  const secretKey = yield call(decryptSecretKey, account, masterPassword)
  const AccountManager = yield select(contractByName, 'AccountManager')
  const existingKey = yield cacheCall(AccountManager, 'publicKeys', address)

  var publicKey = yield call(deriveKeyPair, secretKey)
  var hexPublicKey = '0x' + (yield call([publicKey, publicKey.getPublic], true, 'hex'))

  if (existingKey !== hexPublicKey) {
    yield put({ type: 'SEND_TRANSACTION', transactionId: nextId(), call: createCall(AccountManager, 'setPublicKey', hexPublicKey) })
  }
}

export function* signInOkSaga({ account, masterPassword, address }) {
  signIn(account, masterPassword)
  yield spawn(checkPublicKey, account, masterPassword, address)
  yield put({type: 'SIGNED_IN'})
}

export default function* rootSaga() {
  yield takeEvery('SIGN_IN', signInSaga)
  yield takeEvery('SIGN_IN_OK', signInOkSaga)
}
