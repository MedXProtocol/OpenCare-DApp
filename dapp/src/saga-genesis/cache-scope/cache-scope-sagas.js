import {
  all,
  put,
  select,
  takeEvery,
  getContext,
  setContext,
} from 'redux-saga/effects'

export function* clearCalls() {
  let key = yield getContext('key')
  yield put({type: 'CACHE_DEREGISTER_KEY', key})
}

export function* registerCall(call) {
  let key = yield getContext('key')
  yield put({type: 'CACHE_REGISTER', call, key})
}

function getContractCalls(state, address) {
  return state.sagaGenesis.cacheScope.contractCalls[address]
}

export function* invalidateAddress({ address }) {
  let contractRegistry = yield getContext('contractRegistry')
  let callsMap = yield select(getContractCalls, address)
  if (!callsMap) { return }
  yield* Object.values(callsMap).map(function* (callState) {
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
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export function* runSaga({saga, props, key}) {
  yield setContext({ key })
  yield clearCalls()
  yield saga(props)
  yield put({type: 'END_SAGA', key})
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateTransaction)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('RUN_SAGA', runSaga)
}
