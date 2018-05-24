import { select, put, take, takeEvery, getContext, setContext, fork, call } from 'redux-saga/effects'
import { createCall } from './create-call'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

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

function* web3Send({transactionId, call, options = {}}) {
  const { address, method, args } = call
  try {
    const contractRegistry = yield getContext('contractRegistry')
    const contract = contractRegistry.requireByAddress(address)
    let receipt = yield contract.methods[method](...args).send(options)
    yield put({type: 'WEB3_SEND_RETURN', transactionId, call, receipt})
    return receipt
  } catch (error) {
    yield put({type: 'WEB3_SEND_ERROR', transactionId, call, error})
    throw error
  }
}

function getContractCalls(state, address) {
  return state.cache.contractCalls[address]
}

function* invalidateAddress({ address }) {
  let callsMap = yield select(getContractCalls, address)
  if (!callsMap) { return }
  yield* Object.values(callsMap).map(function* (callState) {
    if (callState.count > 0) {
      yield put({type: 'WEB3_CALL', call: callState.call})
    }
  })
}

function* clearCalls() {
  let key = yield getContext('key')
  yield put({type: 'CACHE_DEREGISTER_KEY', key})
}

function* registerCall(call) {
  let key = yield getContext('key')
  yield put({type: 'CACHE_REGISTER', call, key})
}

export function* cacheCall(address, method, ...args) {
  let call = createCall(address, method, args)
  yield registerCall(call)
  let callState = yield select(state => state.calls[call.hash])
  if (callState && callState.response) {
    return callState.response
  } else {
    if (!callState || !callState.inFlight) {
      yield put({type: 'WEB3_CALL', call})
    }
    // wait for call to return
    while (true) {
      let action = yield take(['WEB3_CALL_RETURN', 'WEB3_CALL_ERROR'])
      if (action.call.hash === call.hash) {
        switch (action.type) {
          case 'WEB3_CALL_RETURN':
            return action.response
          case 'WEB3_CALL_ERROR':
            throw action.error
        }
      }
    }
  }
}

function* runSaga({saga, props, key}) {
  yield setContext({ key })
  yield clearCalls()
  let contractRegistry = yield getContext('contractRegistry')
  yield saga(props, { cacheCall, contractRegistry })
  yield put({type: 'END_SAGA', key})
}

function* web3Accounts() {
  const web3 = yield getContext('web3')
  let accounts = yield web3.eth.getAccounts()
  yield put({type: 'WEB3_ACCOUNTS', accounts})
}

function* startAccountsPolling() {
  while (true) {
    yield put({type: 'WEB3_ACCOUNTS_REFRESH'})
    yield call(delay, 2000)
  }
}

function* invalidateTransaction({transactionId, call, receipt}) {
  var contractAddresses = Object.values(receipt.events).reduce((addressSet, event) => {
    return addressSet.add(event.address)
  }, new Set())
  yield* Array.from(contractAddresses).map(function* (address) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateTransaction)
  yield takeEvery('WEB3_ACCOUNTS_REFRESH', web3Accounts)
  yield takeEvery('CACHE_INVALIDATE_ADDRESS', invalidateAddress)
  yield takeEvery('WEB3_CALL', web3Call)
  yield takeEvery('WEB3_SEND', web3Send)
  yield takeEvery('RUN_SAGA', runSaga)
  yield fork(startAccountsPolling)
}
