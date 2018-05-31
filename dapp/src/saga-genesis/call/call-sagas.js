import {
  put,
  select,
  takeEvery,
  getContext,
  spawn,
  call as sagaCall
} from 'redux-saga/effects'
import { contractKeyByAddress } from '../state-finders'

/*
Triggers the web3 call.
*/
export function* web3Call({call}) {
  const { address, method, args } = call
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    const options = { from: account }
    const contractRegistry = yield getContext('contractRegistry')
    const web3 = yield getContext('web3')
    const contractKey = yield select(contractKeyByAddress, address)
    const contract = contractRegistry.get(address, contractKey, web3)
    const callMethod = contract.methods[method](...args).call
    // console.log('web3Call: ', address, method, ...args, options)
    yield spawn(function* () {
      try {
        let response = yield sagaCall(callMethod, options)
        yield put({type: 'WEB3_CALL_RETURN', call, response})
      } catch (error) {
        yield put({type: 'WEB3_CALL_ERROR', call, error})
      }
    })
  } catch (error) {
    console.error(error)
    yield put({type: 'WEB3_CALL_ERROR', call, error})
  }
}

export default function* () {
  yield takeEvery('WEB3_CALL', web3Call)
}
