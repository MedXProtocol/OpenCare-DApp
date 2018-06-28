import { put, call, takeEvery, select } from 'redux-saga/effects'
import { Account } from '~/accounts/Account'

export function* resetAccountSaga({ account }) {

}

export default function* rootSaga() {
  yield takeEvery('RESET_ACCOUNT', resetAccountSaga)
}
