import { select, put, takeEvery, getContext, setContext } from 'redux-saga/effects'

/*
Triggers the web3 call.
*/
function* web3Call({call}) {
  const { address, method, args } = call
  try {
    const contractRegistry = yield getContext('contractRegistry')
    const contract = contractRegistry.requireByAddress(address)
    let response = yield contract.methods[method](...args).call()
    yield put({type: 'WEB3_CALL_RETURN', call, response})
    return response
  } catch (error) {
    yield put({type: 'WEB3_CALL_ERROR', call, error})
    throw error
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

function* runSaga({saga, props, key}) {
  yield saga(props)
  yield put({type: 'END_SAGA', key})
}

function* web3Accounts() {
  const web3 = yield getContext('web3')
  let accounts = yield web3.eth.getAccounts()
  yield put({type: 'WEB3_ACCOUNTS', accounts})
}

export default function* () {
  yield takeEvery('WEB3_ACCOUNTS_REFRESH', web3Accounts)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('WEB3_CALL', web3Call)
  yield takeEvery('RUN_SAGA', runSaga)
}
