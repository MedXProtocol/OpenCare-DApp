import {
  put
} from 'redux-saga/effects'

import Web3 from 'web3'

function* web3Initialize() {
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider)
    yield put({type: 'WEB3_INITIALIZED', web3})
  } else {
    console.error("window.web3 doesn't exist!")
    yield put({type: 'WEB3_INITIALIZE_ERROR'})
  }
}

export default function* () {
  yield web3Initialize()
}
