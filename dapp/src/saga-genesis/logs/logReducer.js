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
            pastLogsLoaded: false
          }
        }
      }
      break

    case 'PAST_LOGS':
      state = {
        ...state,
        [address]: {
          ...state[address],
          pastLogsLoaded: true,
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
