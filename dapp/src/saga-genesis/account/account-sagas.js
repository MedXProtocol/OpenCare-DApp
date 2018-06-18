import {
  put,
  getContext,
  select,
  call,
  fork
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'

export function* refreshAccounts() {
  const web3 = yield getContext('web3')
  const existingAccount = yield select((state) => state.sagaGenesis.accounts[0])
  let accounts = yield web3.eth.getAccounts()
  if (accounts[0] !== existingAccount) {
    yield put({type: 'WEB3_ACCOUNTS', accounts})
  }
}

export function* startAccountsPolling() {
  while (true) {
    yield call(refreshAccounts)
    yield call(delay, 1000)
  }
}

export default function* () {
  yield fork(startAccountsPolling)
}
