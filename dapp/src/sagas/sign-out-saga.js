import { put, takeEvery } from 'redux-saga/effects'
import {
  signOut
} from '~/services/sign-in'

export function* signOutSaga() {
  signOut()
  yield put({ type: 'TRANSACTIONS_CLEAR' })
}

export default function* rootSaga() {
  yield takeEvery('SIGN_OUT', signOutSaga)
}
