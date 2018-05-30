import {
  put,
  getContext,
  call
} from 'redux-saga/effects'

export function* refreshAccounts() {
  const web3 = yield getContext('web3')
  let accounts = yield web3.eth.getAccounts()
  yield put({type: 'WEB3_ACCOUNTS', accounts})
}

export function* startAccountsPolling() {
  while (true) {
    yield call(refreshAccounts)
    yield call(delay, 2000)
  }
}

export default function* () {
  yield fork(startAccountsPolling)
}
