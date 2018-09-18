import {
  put
} from 'redux-saga/effects'
import Web3 from 'web3'

function* web3Initialize() {
  console.log('in web3Initialize')
  console.log(window.web3)
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider)
    console.log(web3)
    yield put({type: 'WEB3_INITIALIZED', web3})
  } else {
    console.error("window.web3 doesn't exist!")
    yield put({type: 'WEB3_INITIALIZE_ERROR'})
  }
}

export default function* () {
  yield web3Initialize()
}
