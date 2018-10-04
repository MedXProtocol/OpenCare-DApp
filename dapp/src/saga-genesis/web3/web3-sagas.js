import {
  put,
  getContext
} from 'redux-saga/effects'
import Web3 from 'web3'

export function* web3Initialize() {
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider)
    yield put({type: 'WEB3_INITIALIZED', web3})
  } else {
    console.error("window.web3 doesn't exist!")
    yield put({type: 'WEB3_INITIALIZE_ERROR'})
  }
}

export function* web3NetworkId() {
  const web3 = yield getContext('web3')
  return yield web3.eth.net.getId()
}
