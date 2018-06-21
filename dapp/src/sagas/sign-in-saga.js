import { put, takeEvery } from 'redux-saga/effects'
import { signIn } from '~/services/sign-in'
import secretKeyInvalid from '~/services/secret-key-invalid'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { mixpanel } from '~/mixpanel'

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
      yield put({type: 'SIGN_IN_ERROR', masterPasswordError: error.message })
    }
  } else { // error! no existing account
    yield put({type: 'SIGN_IN_ERROR', secretKeyError: 'You must enter a secret key'})
  }
}

export function* signInOkSaga({ account, masterPassword, address }) {
  signIn(account)
  mixpanel.identify(account.address())
  yield put({type: 'SIGNED_IN'})
}

export default function* rootSaga() {
  yield takeEvery('SIGN_IN', signInSaga)
  yield takeEvery('SIGN_IN_OK', signInOkSaga)
}
