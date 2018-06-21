import {
  put,
  select,
  takeEvery,
  fork,
  getContext,
  setContext,
  spawn
} from 'redux-saga/effects'
import {
  contractKeyByAddress
} from '../state-finders'

export function* deregisterKey({key}) {
  const callCountRegistry = yield getContext('callCountRegistry')
  const calls = callCountRegistry.deregister(key)
  if (calls.length) {
    yield put({type: 'WEB3_STALE_CALLS', calls})
  }
}

export function* registerCall(call) {
  let key = yield getContext('key')
  if (!key) {
    throw new Error(`registerCall called without a key scope: ${JSON.stringify(call)}`)
  }
  let callCountRegistry = yield getContext('callCountRegistry')
  callCountRegistry.register(call, key)
}

export function* invalidateAddress({ address }) {
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
  let contractAddresses = Object.values(receipt.events || {}).reduce((addressSet, event) => {
    return addressSet.add(event.address)
  }, new Set())

  contractAddresses.add(call.address)

  yield* Array.from(contractAddresses).map(function* (address) {
    const contractKey = yield select(contractKeyByAddress, address)
    if (contractKey) {
      yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
    }
  })
}

export function* runSaga({saga, props, key}) {
  yield setContext({ key })
  yield deregisterKey({ key })
  yield spawn(saga, props)
}

export default function* () {
  yield takeEvery('TRANSACTION_CONFIRMED', invalidateTransaction)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('CACHE_DEREGISTER_KEY', deregisterKey)
  yield takeEvery('RUN_SAGA', runSaga)
}
