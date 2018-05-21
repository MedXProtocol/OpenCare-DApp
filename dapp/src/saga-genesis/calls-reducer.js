export default function (state, {type, call}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'WEB3_CALL':
      state = {
        ...state,
        [call.hash]: {
          ...state[call.hash],
          inFlight: true
        }
      }
      break
      
    case 'WEB3_CALL_RETURN':
      state = {
        ...state,
        [call.hash]: {
          ...state[call.hash],
          inFlight: false,
          response: action.response
        }
      }
      break

    case 'WEB3_CALL_ERROR':
      state = {
        ...state,
        [call.hash]: {
          ...state[call.hash],
          inFlight: false,
          error: action.error
        }
      }
      break
  }

  return state
}
