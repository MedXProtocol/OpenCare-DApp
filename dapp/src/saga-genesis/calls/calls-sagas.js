
/*
Triggers the web3 call.
*/
function* web3Call({call}) {
  const { address, method, args } = call
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    const options = { from: account }
    const contractRegistry = yield getContext('contractRegistry')
    const contract = contractRegistry.requireByAddress(address)
    const callMethod = contract.methods[method](...args).call
    // console.log('web3Call: ', address, method, ...args, options)
    let response = yield sagaCall(callMethod, options)
    yield put({type: 'WEB3_CALL_RETURN', call, response})
    return response
  } catch (error) {
    console.error(error)
    yield put({type: 'WEB3_CALL_ERROR', call, error})
  }
}

export function* cacheCall(address, method, ...args) {
  let call = createCall(address, method, ...args)
  yield registerCall(call)
  let callState = yield select(state => state.sagaGenesis.calls[call.hash])
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

export default function* () {
  yield takeEvery('WEB3_CALL', web3Call)
}
