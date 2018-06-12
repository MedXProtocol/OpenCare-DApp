export class CallCountRegistry {
  constructor() {
    this.contractCalls = {}
    this.keyCalls = {}
  }

  count (call) {
    let callState = this._getContractCallState(call)
    if (callState) {
      return callState.count
    } else {
      return 0
    }
  }

  register (call, key) {
    this._increment(call)
    this._getKeyCalls(key).push(call)
  }

  deregister (key) {
    let deletedCalls = this._getKeyCalls(key).reduce((accumulator, call) => {
      if (!this._decrement(call)) {
        accumulator.push(call)
      }
      return accumulator
    }, [])
    delete this.keyCalls[key]
    return deletedCalls
  }

  getContractCalls (address) {
    if (!address) { return {} }
    address = address.toLowerCase()
    let contractCalls = this.contractCalls[address]
    if (!contractCalls) {
      contractCalls = {}
      this.contractCalls[address] = contractCalls
    }
    return contractCalls
  }

  _getKeyCalls (key) {
    let keyCalls = this.keyCalls[key]
    if (!keyCalls) {
      keyCalls = []
      this.keyCalls[key] = keyCalls
    }
    return keyCalls
  }

  _increment (call) {
    let callState = this._getContractCallState(call)
    if (callState) {
      callState.count += 1
    } else {
      callState = {
        count: 1,
        call: call
      }
      this.getContractCalls(call.address)[call.hash] = callState
    }
  }

  _decrement (call) {
    let callState = this._getContractCallState(call)
    let result = 0
    if (callState) {
      callState.count -= 1
      if (callState.count === 0) {
        delete this.getContractCalls(call.address)[call.hash]
      } else {
        result = callState.count
      }
    }
    return result
  }

  _getContractCallState (call) {
    return this.getContractCalls(call.address)[call.hash]
  }
}
