import { select, put, takeEvery } from 'redux-saga/effects'

/*
Triggers the web3 call.
*/
function createWeb3Call({ contractRegistry }) {
  return function* ({call}) {
    const { address, method, args } = call
    try {
      const contract = contractRegistry.requireByAddress(address)
      let response = yield contract.methods[method](...args).call()
      yield put({type: 'WEB3_CALL_RETURN', call, response})
      return response
    } catch (error) {
      yield put({type: 'WEB3_CALL_ERROR', call, error})
      throw error
    }
  }
}

function getContractCalls(state, address) {
  return state.cache.contractCalls[address]
}

function* invalidateAddress(action) {
  const { address } = action
  let callHash = yield select(getContractCalls, address)
  if (!callHash) { return }
  yield* Object.values(callHash).map(function* (cacheCall) {
    yield put({type: 'WEB3_CALL', call: cacheCall.call})
  })
}

export default function* (options) {
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('WEB3_CALL', createWeb3Call(options))
}
