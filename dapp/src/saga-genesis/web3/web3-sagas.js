import {
  put
} from 'redux-saga/effects'

import Web3 from 'web3'

function* web3Initialize() {
  if (window.web3) {
    let web3
    console.log(typeof process.env.REACT_APP_REQUIRED_NETWORK_ID)
    console.log(process.env.REACT_APP_REQUIRED_NETWORK_ID)
    if (process.env.REACT_APP_REQUIRED_NETWORK_ID === '4') {
      web3 = new Web3('https://rinkeby.infura.io/To0546l6M9AapR2JxoHN')
      console.log('web3 set to ', 'https://rinkeby.infura.io/To0546l6M9AapR2JxoHN')
    } else {
      web3 = new Web3(window.web3.currentProvider)
      console.log('web3 set to ', window.web3.currentProvider)
    }

    yield put({type: 'WEB3_INITIALIZED', web3})
  } else {
    console.error("window.web3 doesn't exist!")
    yield put({type: 'WEB3_INITIALIZE_ERROR'})
  }
}

export default function* () {
  yield web3Initialize()
}
