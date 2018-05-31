import {
  all,
  put,
  select,
  takeEvery,
  fork,
  getContext,
  setContext,
  spawn
} from 'redux-saga/effects'

export function* deregisterKey({key}) {
  let callCountRegistry = yield getContext('callCountRegistry')
  yield* callCountRegistry.deregister(key)
}

export function* registerCall(call) {
  let key = yield getContext('key')
  let callCountRegistry = yield getContext('callCountRegistry')
  callCountRegistry.register(call, key)
}

export function* invalidateAddress({ address }) {
  let contractRegistry = yield getContext('contractRegistry')
  let callCountRegistry = yield getContext('callCountRegistry')
  let contractCalls = Object.values(callCountRegistry.getContractCalls(address))
  if (!contractCalls) { return }
  yield* contractCalls.map(function* (callState) {
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
  yield deregisterKey({ key })
  yield spawn(saga, props)
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateTransaction)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('CACHE_DEREGISTER_KEY', deregisterKey)
  yield takeEvery('RUN_SAGA', runSaga)
}
