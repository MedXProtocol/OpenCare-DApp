import {
  put,
  setContext,
  take,
  call,
  fork
} from 'redux-saga/effects'

import Web3 from 'web3'

function* web3Initialize() {
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider)
    yield put({type: 'WEB3_INITIALIZED', web3})
  } else {
    yield put({type: 'WEB3_INITIALIZE_ERROR'})
  }
}

export function* takeWeb3Initialized(saga) {
  const action = yield take('WEB3_INITIALIZED')
  yield saga(action)
}

export default function* () {
  yield web3Initialize()
}
