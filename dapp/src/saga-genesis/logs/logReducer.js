export default function (state, { type, address, logs, log }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'ADD_LOG_LISTENER':
      if (!state[address]) {
        state = {
          ...state,
          [address]: {
            logsFetched: false
          }
        }
      }
      break

    case 'FETCH_PAST_LOGS':
      state = {
        ...state,
        [address]: {
          ...state[address],
          logsFetched: true
        }
      }
      break

    case 'PAST_LOGS':
      state = {
        ...state,
        [address]: {
          ...state[address],
          logs
        }
      }
      break

    case 'NEW_LOG':
      state = {...state}
      state[address].logs.push(log)

      break

    case 'REMOVE_LOG_LISTENER':
      if (state[address]) {
        state = {...state}
        delete state[address]
      }
      break

    // no default
  }

  return state
}
