import hashCall from '@/saga-genesis/hash-call'

export default function(state, address, method, ...args) {
  const hash = hashCall(address, method, args)
  return state.calls[hash] || {}
}
