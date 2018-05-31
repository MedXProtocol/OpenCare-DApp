import {
  all,
  put,
  select,
  takeEvery,
  getContext,
  setContext,
  spawn
} from 'redux-saga/effects'

export function* deregisterKey({key}) {
  let cacheScope = yield getContext('cacheScope')
  yield* cacheScope.deregister(key).map(function* (call) {
    // yield put({type: 'WEB3_CALL_CLEAR', call})
    // console.log('cleared: ', call.method)
  })
}

export function* clearCalls() {
  let key = yield getContext('key')
  yield deregisterKey({key})
}

export function* registerCall(call) {
  let key = yield getContext('key')
  let cacheScope = yield getContext('cacheScope')
  cacheScope.register(call, key)
}

function getContractCalls(state, address) {
  return state.sagaGenesis.cacheScope.contractCalls[address]
}

export function* invalidateAddress({ address }) {
  let contractRegistry = yield getContext('contractRegistry')
  let cacheScope = yield getContext('cacheScope')
  let callStates = Object.values(cacheScope.getContractCalls(address))
  if (!callStates) { return }
  yield* callStates.map(function* (callState) {
    if (callState.count > 0) {
      yield put({type: 'WEB3_CALL', call: callState.call})
    }
  })
}

export function* invalidateTransaction({transactionId, call, receipt}) {
  var contractAddresses = Object.values(receipt.events || {}).reduce((addressSet, event) => {
    return addressSet.add(event.address)
  }, new Set())
  yield* Array.from(contractAddresses).map(function* (address) {
    yield spawn(function* () {
      yield put({type: 'CACHE_INVALIDATE_ADDRESS', address})
    })
  })
}

export function* runSaga({saga, props, key}) {
  yield setContext({ key })
  yield clearCalls()
  yield spawn(saga, props)
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateTransaction)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('CACHE_DEREGISTER_KEY', deregisterKey)
  yield takeEvery('RUN_SAGA', runSaga)
}
