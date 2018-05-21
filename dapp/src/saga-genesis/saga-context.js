import { select, put, takeEvery } from 'redux-saga/effects'
import getWeb3 from '@/get-web3'

export class SagaContext {
  constructor({genesis, saga, callback}) {
    this.genesis = genesis
    this.saga = saga
    this.callback = callback
  }

  clearCalls () {
    this.genesis.clear(this)
  }

  registerCall (call) {
    this.genesis.register(this, call)
  }

  genesis () {
    return this.genesis
  }

  wrappedSaga = function* (props) {
    this.clearCalls()
    yield this.setContext({web3: getWeb3})
    return this.saga(props, this)
  }

  web3Call = function* (web3Contract, method, ...args) {
    let call = {web3Contract, method, args}
    call.hash = this.hashCall(call)
    let callState = yield select(state => state[call.hash])
    if (callState.response) {
      return callState.response
    } else {
      if (!callState.inFlight) {
        try {
          put({type: 'WEB3_CALL', call}) // updates the state
          let response = yield web3Contract.methods[method](...args).call()
          put({type: 'WEB3_CALL_RETURN', call, response})
          return response
        } catch (error) {
          put({type: 'WEB3_CALL_ERROR', call, error})
          throw error
        }
      } else {
        // wait for call to return
        let action = takeEvery(['WEB3_CALL_RETURN', 'WEB3_CALL_ERROR'])
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

  hashCall = function (call) {
    return getWeb3().utils.sha3(call.address + call.method + call.args.join(','))
  }
}
