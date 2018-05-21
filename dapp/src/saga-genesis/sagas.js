function hashCall(call) {
  return web3.utils.sha3(call.address + call.method + call.args.join(','))
}

/*
Triggers the web3 call.  Returns immediately if cache hit, otherwise call and
return.
*/
function* web3Call(address, method, ...args) {
  let call = {address, method, args}
  call.hash = hashCall(call)
  let callState = yield select(state => state[call.hash])
  if (callState.response) {
    return callState.response
  } else {
    if (!callState.inFlight) {
      try {
        put({type: 'WEB3_CALL', call}) // updates the state
        let response = yield contract.methods[method](...args).call()
        put({type: 'WEB3_CALL_RETURN', call, response})
        return response
      } catch (error) {
        put({type: 'WEB3_CALL_ERROR', call, error})
        throw error
      }
    } else {
      // wait for call to return
      let action = takeEvery(['WEB3_CALL_RETURN', 'WEB3_CALL_ERROR'])
      if (action.call.hash === call.hash)) {
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















// When a value is requested, it should be added to the value's listeners.
// If the value is available and cached, it is returned.
// If the value is in-flight, we wait.
// If the value needs to be requested, we do.

// When cache is invalidated the listeners need to be notified.  The entire
// saga runs again.


/*

  How does this caching work?

  1. Components pull in data.  By pulling in data they declare what data they need.
  2. When data changes, data is pushed to the components.
*/
