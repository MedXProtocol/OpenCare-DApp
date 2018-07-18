import {
  put,
  select,
  getContext,
  take,
  takeEvery,
  cancelled,
  spawn,
  call as reduxSagaCall
} from 'redux-saga/effects'
import { registerCall, callCount } from '../cache-scope/cache-scope-sagas'
import { createCall } from '../utils/create-call'
import { contractKeyByAddress } from '../state-finders'

const callsInFlight = new Set()

function* isCacheActive(call) {
  const count = yield callCount(call)
  return count > 0
}

function isInFlight(call) {
  return callsInFlight.has(call.hash)
}

function* findResponse(call) {
  const callState = yield select(state => state.sagaGenesis.callCache[call.hash])
  return !callState || callState.response
}

function* waitForResponse(call) {
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

function* runCall(call, cacheActive) {
  let response = null
  const inFlight = isInFlight(call)
  if (cacheActive && !inFlight) {
    response = yield findResponse(call)
    // console.log('runCall: Returning cached response: ', call.method, call.hash, response)
  } else {
    if (!inFlight) {
      callsInFlight.add(call.hash)
      // console.log('runCall WEB3_CALL: ', call.method, call.hash)
      yield put({ type: 'WEB3_CALL', call })
    } else {
      // console.log('runCall SKIP WEB3_CALL: ', call.method, call.hash)
    }
    // console.log('runCall WEB3_CALL waiting for response: ', call.method, call.hash)
    response = yield waitForResponse(call)
    // console.log('runCall RECEIVED: ', call.method, call.hash, response)
  }
  return response
}

/**
  Calls web3Call and increments the call count
*/
export function* cacheCall(address, method, ...args) {
  const call = createCall(address, method, ...args)
  // console.log('cacheCall: ', call.method, call.hash)
  const cacheActive = yield isCacheActive(call)
  yield registerCall(call)
  return yield runCall(call, cacheActive)
}

export function* web3Call(address, method, ...args) {
  const call = createCall(address, method, ...args)
  const cacheActive = yield isCacheActive(call)
  return yield runCall(call, cacheActive)
}

function* findCallMethod(call) {
  const { address, method, args } = call
  const contractRegistry = yield getContext('contractRegistry')
  const web3 = yield getContext('web3')
  const contractKey = yield select(contractKeyByAddress, address)
  const contract = contractRegistry.get(address, contractKey, web3)
  const contractMethod = contract.methods[method]
  if (!contractMethod) {
    yield put({ type: 'WEB3_CALL_ERROR', call, error: `Address ${address} does not have method '${method}'` })
    return
  }
  return contractMethod(...args).call
}

/*
Triggers the web3 call.
*/
function* web3CallExecute({call}) {
  // console.log('web3CallExecute: ', call.method, call.hash)
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    const options = { from: account }
    const callMethod = yield findCallMethod(call)
    // console.log('web3CallExecute: ', address, method, ...args, options)
    yield spawn(function* () {
      try {
        // console.log('web3CallExecute: ', call.method, call.hash)
        let response = yield reduxSagaCall(callMethod, options, 'pending')
        // console.log('web3CallReturn: ', call.method, call.hash, response)
        yield put({ type: 'WEB3_CALL_RETURN', call, response })
      } catch (error) {
        // console.error('web3CallExecute: ERROR: ', call.method, call.hash)
        yield put({ type: 'WEB3_CALL_ERROR', call, error })
      } finally {
        callsInFlight.delete(call.hash)
      }
    })
  } catch (error) {
    if (yield cancelled()) {
      // console.log('web3CallExecute: CANCELLED: ', call.method, call.hash)
      yield put({ type: 'WEB3_CALL_CANCELLED', call })
    } else {
      console.error(error)
      yield put({ type: 'WEB3_CALL_ERROR', call, error })
    }
  }
}

export default function* () {
  yield takeEvery('WEB3_CALL', web3CallExecute)
}
