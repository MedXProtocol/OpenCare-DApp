import BigNumber from 'bignumber.js'
import cacheCallState from './cache-call-state'

export default function(state, address, method, ...args) {
  const callState = cacheCallState(state, address, method, ...args)
  let response = callState.response
  if (response) {
    var bigNum = new BigNumber(response)
  }
  return bigNum
}
