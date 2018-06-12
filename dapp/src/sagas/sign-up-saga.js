import { put, call, takeEvery } from 'redux-saga/effects'

import { buildAccount } from '~/services/build-account'
import { getAccount } from '~/services/get-account'
import { setAccount } from '~/services/set-account'

export function* signUpSaga({ address, secretKey, masterPassword, overrideAccount }) {
  if (!address) {
    yield put({ type: 'SIGN_IN_ERROR', addressError: 'Address is not defined' })
    return
  }
  if (!masterPassword) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError: 'You must define a master password' })
    return
  }
  if (masterPassword.length < 8) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError: 'The master password must be at least 8 characters long' })
    return
  }
  let account = getAccount(address)
  if (account && !overrideAccount) {
    yield put({type: 'SIGN_IN_ERROR', overrideError: true })
  } else {
    const account = yield call(buildAccount, address, secretKey, masterPassword)
    yield call(setAccount, address, account)
    yield put({type: 'SIGN_IN_OK', account, masterPassword, address})
  }
}

export default function* rootSaga() {
  yield takeEvery('SIGN_UP', signUpSaga)
}
