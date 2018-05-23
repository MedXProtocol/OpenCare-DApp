function getCount(state, call) {
  const { address, method, args, hash } = call

  var result = 0
  if (state.contractCalls[address] && state.contractCalls[address][call.hash]) {
    result = state.contractCalls[address][call.hash].count
  }
  return result
}

export default function (state, {type, call}) {
  if (typeof state === 'undefined') {
    state = {
      // stores a count of the registered calls.
      contractCalls: {
        /*
        [call.address]: {
          [call.hash]: {
            call,
            count: <register increments, deregister decrements>
          }
        }
        */
      }
    }
  }

  if (call) {
    var { address, method, args, hash } = call
    var count = getCount(state, call)
  }

  switch (type) {
    case 'CACHE_REGISTER':
      state = {
        contractCalls: {
          ...state.contractCalls,
          [address]: {
            ...state.contractCalls[address],
            [call.hash]: {
              count: count + 1,
              call
            }
          }
        }
      }
      break

    case 'CACHE_DEREGISTER':
      if (count == 1) {
        state = {...state}
        delete state.contractCalls[address][call.hash]
      } else {
        state = {
          contractCalls: {
            ...state.contractCalls,
            [address]: {
              ...state[address],
              [call.hash]: {
                count: count - 1,
                call
              }
            }
          }
        }
      }
      break
  }

  return state
}
