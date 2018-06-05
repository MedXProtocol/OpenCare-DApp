import { put, call, select, takeEvery } from 'redux-saga'

import { buildAccount } from '@/services/build-account'
import { getAccount } from '@/services/get-account'
import { signIn } from '@/services/sign-in'
import { setAccount } from '@/services/set-account'
import { deriveKeyPair } from '@/services/derive-key-pair'
import { createCall } from '@/saga-genesis/utils/create-call'
import { contractByName } from '@/saga-genesis/state-finders'

export function* signUpSaga({ address, secretKey, masterPassword }) {
  if (!address) {
    yield put({ type: 'SIGN_UP_ERROR', addressError: 'Address is not defined' })
  }
  const account = yield call(buildAccount, address, secretKey, masterPassword)
  yield call(setAccount, address, account)
  yield put({type: 'SIGN_IN_OK', account, masterPassword})
}

export default function* rootSaga() {
  yield takeEvery('SIGN_UP', signUpSaga)
}
