import { put, takeEvery } from 'redux-saga/effects'
import {
  signOut
} from '~/services/sign-in'

export function* signOutSaga() {
  signOut()
  yield put({ type: 'SIGNED_OUT' })
  yield put({ type: 'WEB3_SHH_DISCONNECT' })
}

export default function* rootSaga() {
  yield takeEvery('SIGN_OUT', signOutSaga)
}
