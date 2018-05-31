import {
  select,
  put,
  getContext,
  call as sagaCall,
  takeEvery
} from 'redux-saga/effects'
import { contractKeyByAddress } from '../state-finders'

export function* web3Send({ transactionId, call, options }) {
  const { address, method, args } = call
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    options = options || {
      from: account
    }
    const contractRegistry = yield getContext('contractRegistry')
    const web3 = yield getContext('web3')
    const contractKey = yield select(contractKeyByAddress, address)
    const contract = contractRegistry.get(address, contractKey, web3)
    // console.log('web3Send: ', address, method, ...args, options)
    const send = contract.methods[method](...args).send
    let receipt = yield sagaCall(send, options)
    yield put({type: 'WEB3_SEND_RETURN', transactionId, call, receipt})
    return receipt
  } catch (error) {
    console.error(error)
    yield put({type: 'WEB3_SEND_ERROR', transactionId, call, error})
  }
}

export default function* () {
  yield takeEvery('WEB3_SEND', web3Send)
}