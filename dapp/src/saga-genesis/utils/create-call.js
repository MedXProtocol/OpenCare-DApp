import hashCall from './hash-call'

export function createCall(address, method, ...args) {
  let call = {
    address,
    method,
    args,
    toString: function () {
      return `${address}: ${method}(${args.map(a => a.toString()).join(', ')})`
    }
  }
  call.hash = hashCall(address, method, ...args)
  return call
}
