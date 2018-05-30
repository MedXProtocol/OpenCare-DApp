import hashCall from './utils/hash-call'

export default function(state, ...args) {
  const hash = hashCall.apply(null, args)
  return state.sagaGenesis.callCache[hash] || {}
}
