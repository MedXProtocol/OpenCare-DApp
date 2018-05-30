import hashCall from '@/saga-genesis/hash-call'

export default function(state, ...args) {
  const hash = hashCall.apply(null, args)
  return state.sagaGenesis.calls[hash] || {}
}
