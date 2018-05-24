function getCount(state, call) {
  const { address, method, args, hash } = call

  var result = 0
  if (state.contractCalls[address] && state.contractCalls[address][call.hash]) {
    result = state.contractCalls[address][call.hash].count
  }
  return result
}

export default function (state, {type, call, key}) {
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
      },
      keyCalls: {
        /*
        [key]: []
        */
      }
    }
  }

  switch (type) {
    case 'CACHE_REGISTER':
      var { address, method, args, hash } = call
      var count = getCount(state, call)
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
        },
        keyCalls: {
          ...state.keyCalls,
          [key]: (state.keyCalls[key] || []).concat([call])
        }
      }
      break

    case 'CACHE_DEREGISTER_KEY':
      let contractAddressCallMappings = (state.keyCalls[key] || []).reduce((contractCalls, call) => {
        const { address, method, args, hash } = call
        const count = getCount(state, call)

        let addressCalls
        if (count == 1) {
          addressCalls = {...contractCalls[address]}
          delete addressCalls[hash]
        } else {
          addressCalls = {
            ...contractCalls[address],
            [call.hash]: {
              count: count - 1,
              call
            }
          }
        }
        return {
          ...contractCalls,
          [address]: addressCalls
        }
      }, state.contractCalls)

      state = {
        contractCalls: {
          ...state.contractCalls,
          ...contractAddressCallMappings
        },
        keyCalls: {
          ...state.keyCalls,
          [key]: []
        }
      }
      break
  }

  return state
}
