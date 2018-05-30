import hashCall from './hash-call'

export function createCall(address, method, ...args) {
  let call = {address, method, args}
  call.hash = hashCall(address, method, ...args)
  return call
}
