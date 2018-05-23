import { select, put, take, setContext } from 'redux-saga/effects'
import hashCall from '@/saga-genesis/hash-call'

export function sagaCacheContext({saga, web3, contractRegistry}) {
  if (!saga) throw `Saga is not defined`
  if (!web3) throw `web3 is not defined`
  if (!contractRegistry) throw `contractRegistry is not defined`
  
  let calls = []

  function* clearCalls() {
    yield* calls.map(function* (call) {
      yield put({type: 'CACHE_DEREGISTER', call})
    })
    calls = []
  }

  function* registerCall(call) {
    calls.push(call)
    yield put({type: 'CACHE_REGISTER', call})
  }

  let context = {
    contractRegistry,
    cacheCall: function* (address, method, ...args) {
      let call = {address, method, args}
      call.hash = hashCall(address, method, args)
      yield registerCall(call)
      let callState = yield select(state => state.calls[call.hash])
      if (callState && callState.response) {
        return callState.response
      } else {
        if (!callState || !callState.inFlight) {
          yield put({type: 'WEB3_CALL', call, contractRegistry: contractRegistry})
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
  }

  return function* (props) {
    yield clearCalls()
    yield setContext({web3})
    return yield saga(props, context)
  }
}
