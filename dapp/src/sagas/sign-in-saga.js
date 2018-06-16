import { put, spawn, takeEvery, select } from 'redux-saga/effects'
import { createCall } from '~/saga-genesis/utils'
import { web3Call } from '~/saga-genesis/sagas'
import { contractByName } from '~/saga-genesis/state-finders'
import {
  signIn
} from '~/services/sign-in'
import { nextId } from '~/saga-genesis'
import secretKeyInvalid from '~/services/secret-key-invalid'
import masterPasswordInvalid from '~/services/master-password-invalid'

// Here the sign in should perform the check
export function* signInSaga({ secretKey, masterPassword, account, address, overrideAccount }) {
  var masterPasswordError = masterPasswordInvalid(masterPassword)
  if (masterPasswordError) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError })
    return
  }
  if (secretKey) { //Then we are creating or signing into a new account
    var secretKeyError = secretKeyInvalid(secretKey)
    if (secretKeyError) {
      yield put({ type: 'SIGN_IN_ERROR', secretKeyError })
      return
    }
    yield put({type: 'SIGN_UP', address, secretKey, masterPassword, overrideAccount})
  } else if (account) { // Check the existing account
    try {
      account.unlock(masterPassword)
      yield put({type: 'SIGN_IN_OK', account, masterPassword, address})
    } catch (error) {
      yield put({type: 'SIGN_IN_ERROR', masterPasswordError: error })
    }
  } else { // error! no existing account
    yield put({type: 'SIGN_IN_ERROR', secretKeyError: 'You must enter a secret key'})
  }
}

export function* checkPublicKey(account, masterPassword, address) {
  const AccountManager = yield select(contractByName, 'AccountManager')
  const existingKey = yield web3Call(AccountManager, 'publicKeys', address)
  const hexPublicKey = '0x' + account.hexPublicKey()
  if (existingKey !== hexPublicKey) {
    yield put({ type: 'SEND_TRANSACTION', transactionId: nextId(), call: createCall(AccountManager, 'setPublicKey', hexPublicKey) })
  }
}

export function* signInOkSaga({ account, masterPassword, address }) {
  signIn(account)
  yield spawn(checkPublicKey, account, masterPassword, address)
  yield put({type: 'SIGNED_IN'})
}

export default function* rootSaga() {
  yield takeEvery('SIGN_IN', signInSaga)
  yield takeEvery('SIGN_IN_OK', signInOkSaga)
}
