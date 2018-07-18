import {
  put,
  select,
  takeEvery,
  takeLatest,
  fork,
  getContext,
  setContext,
  call as callSaga,
  cancel,
  cancelled,
  take
} from 'redux-saga/effects'
import {
  contractKeyByAddress
} from '../state-finders'

export function* deregisterKey(key) {
  // console.log('DEREGISTER ', key)
  const callCountRegistry = yield getContext('callCountRegistry')
  // console.log('deregisterKey: ', key)
  const calls = callCountRegistry.deregister(key)
  if (calls.length) {
    yield put({type: 'WEB3_STALE_CALLS', calls})
  }
}

export function* registerCall(call) {
  // console.log('registerCall: ', call.method, call.hash)
  let key = yield getContext('key')
  if (!key) {
    throw new Error(`registerCall called without a key scope: ${JSON.stringify(call)}`)
  }
  let callCountRegistry = yield getContext('callCountRegistry')
  callCountRegistry.register(call, key)
}

export function* callCount(call) {
  let callCountRegistry = yield getContext('callCountRegistry')
  return callCountRegistry.count(call)
}

export function* invalidateAddress({ address }) {
  let callCountRegistry = yield getContext('callCountRegistry')
  let contractCalls = Object.values(callCountRegistry.getContractCalls(address))
  if (!contractCalls) { return }
  yield* contractCalls.map(function* (callState) {
    if (callState.count > 0) {
      const { call } = callState
      // console.log('invalidate address: ', call.method, call.hash)
      yield put({type: 'WEB3_CALL', call })
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
  // console.log(`RUN SAGA ${key} ${typeof key}____________`)
  try {
    yield setContext({ key })
    const callCountRegistry = yield getContext('callCountRegistry')
    let oldCalls = callCountRegistry.resetKeyCalls(key)
    yield callSaga(saga, props)
    const emptyCalls = callCountRegistry.decrementCalls(oldCalls)
    if (emptyCalls.length) {
      yield put({ type: 'WEB3_STALE_CALLS', emptyCalls })
    }
  } catch (error) {
    // console.log(`ERRRRRROR Saga ${key} !!!!!!!!!!!!!!!!!!`)
    if (yield cancelled()) {
      // console.log(`KILLED Saga ${key} !!!!!!!!!!!!!!!!!!`)
    } else {
      throw error
    }
  }
}

function* prepareSaga({ saga, props, key }) {
  const action = `RUN_SAGA_${key}`
  // console.log(`PREPARE SAGA ${key}`)
  yield runSaga({ saga, props, key })
  const task = yield takeLatest(action, runSaga)
  yield take(`END_SAGA_${key}`)
  yield deregisterKey(key)
  yield cancel(task)
}

export default function* () {
  yield takeEvery('TRANSACTION_CONFIRMED', invalidateTransaction)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('PREPARE_SAGA', prepareSaga)
}
