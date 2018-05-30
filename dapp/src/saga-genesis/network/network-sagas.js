import {
  put,
  getContext,
  call,
  fork
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'

export function* refreshNetwork() {
  const web3 = yield getContext('web3')
  let networkId = yield web3.eth.net.getId()
  yield put({type: 'WEB3_NETWORK_ID', networkId})
}

export function* startNetworkPolling() {
  while (true) {
    yield call(refreshNetwork)
    yield call(delay, 2000)
  }
}

export default function* () {
  yield fork(startNetworkPolling)
}
