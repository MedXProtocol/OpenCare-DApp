import {
  put,
  select,
  getContext,
  spawn,
  take
} from 'redux-saga/effects'
import { registerCall } from '../cache-scope/cache-scope-sagas'
import { createCall } from '../utils/create-call'

function* triggerCall(call) {
  yield put({type: 'WEB3_CALL', call})
}

export function* cacheCall(address, method, ...args) {
  let call = createCall(address, method, ...args)
  yield registerCall(call)
  let callState = yield select(state => state.sagaGenesis.callCache[call.hash])

  if (callState && callState.response) {
    return callState.response
  } else {
    if (!callState || !callState.inFlight) {
      yield spawn(triggerCall, call)
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
