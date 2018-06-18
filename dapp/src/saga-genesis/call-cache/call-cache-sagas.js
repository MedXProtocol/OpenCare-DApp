import {
  put,
  select,
  getContext,
  spawn,
  fork,
  take,
  takeEvery,
  call as sagaCall
} from 'redux-saga/effects'
import { registerCall } from '../cache-scope/cache-scope-sagas'
import { createCall } from '../utils/create-call'
import { contractKeyByAddress } from '../state-finders'

export function* cacheCall(address, method, ...args) {
  let call = createCall(address, method, ...args)
  let callState = yield select(state => state.sagaGenesis.callCache[call.hash])
  const isHot = callState && !callState.stale && callState.response
  // the registerCall could be pulled up into a different function that wraps this one
  yield registerCall(call)
  // If the callState has a response and it's hot and fresh then return it
  if (isHot) {
    return callState.response
  } else { // Retrieve or wait for the new state
    return yield web3Call(address, method, ...args)
  }
}

export function* web3Call(address, method, ...args) {
  let call = createCall(address, method, ...args)
  let callState = yield select(state => state.sagaGenesis.callCache[call.hash])
  if (!callState || !callState.inFlight) {
    yield spawn(put, {type: 'WEB3_CALL', call})
  }
  // wait for call to return
  while (true) {
    let action = yield take(['WEB3_CALL_RETURN', 'WEB3_CALL_ERROR'])
    if (action.call.hash === call.hash) {
      switch (action.type) {
        case 'WEB3_CALL_RETURN':
          return action.response
        default:
          throw action.error
      }
    }
  }
}

/*
Triggers the web3 call.
*/
function* web3CallExecute({call}) {
  const { address, method, args } = call
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    const options = { from: account }
    const contractRegistry = yield getContext('contractRegistry')
    const web3 = yield getContext('web3')
    const contractKey = yield select(contractKeyByAddress, address)
    const contract = contractRegistry.get(address, contractKey, web3)
    const contractMethod = contract.methods[method]
    if (!contractMethod) {
      yield fork(put, {type: 'WEB3_CALL_ERROR', call, error: `Address ${address} does not have method '${method}'`})
      return
    }
    const callMethod = contractMethod(...args).call
    // console.log('web3CallExecute: ', address, method, ...args, options)
    yield spawn(function* () {
      try {
        let response = yield sagaCall(callMethod, options, 'pending')
        yield fork(put, {type: 'WEB3_CALL_RETURN', call, response})
      } catch (error) {
        yield fork(put, {type: 'WEB3_CALL_ERROR', call, error})
      }
    })
  } catch (error) {
    console.error(error)
    yield put({type: 'WEB3_CALL_ERROR', call, error})
  }
}

export default function* () {
  yield takeEvery('WEB3_CALL', web3CallExecute)
}
