import { put, call, takeEvery, select } from 'redux-saga/effects'
import {
  signOut
} from '~/services/sign-in'

export function* signOutSaga() {
  signOut()
}

export default function* rootSaga() {
  yield takeEvery('SIGN_OUT', signOutSaga)
}
