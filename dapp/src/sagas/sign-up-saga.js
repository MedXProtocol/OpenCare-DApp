import { put, call, takeEvery } from 'redux-saga/effects'
import masterPasswordInvalid from '~/services/master-password-invalid'

import { Account } from '~/accounts/Account'

export function* signUpSaga({ address, secretKey, masterPassword, overrideAccount }) {
  if (!address) {
    yield put({ type: 'SIGN_IN_ERROR', addressError: 'Address is not defined' })
    return
  }
  var masterPasswordError = masterPasswordInvalid(masterPassword)
  if (masterPasswordError) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError })
    return
  }
  let account = Account.get(address)
  if (account && !overrideAccount) {
    yield put({type: 'SIGN_IN_ERROR', overrideError: true })
  } else {
    const account = yield call(Account.create, { address, secretKey, masterPassword })
    yield put({type: 'SIGN_IN_OK', account, masterPassword, address})
  }
}

export default function* rootSaga() {
  yield takeEvery('SIGN_UP', signUpSaga)
}
