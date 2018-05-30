export default function (state, {type, transactionId, call, error, receipt}) {
  if (typeof state === 'undefined') {
    state = {
      transactions: {}
    }
  }

  switch (type) {
    case 'WEB3_SEND':
      state = {
        ...state,
        [transactionId]: {
          inFlight: true
        }
      }
      break

    case 'WEB3_SEND_RETURN':
      state = {
        ...state,
        [transactionId]: {
          inFlight: false,
          complete: true,
          receipt
        }
      }
      break

    case 'WEB_SEND_ERROR':
      state = {
        ...state,
        [transactionId]: {
          inFlight: false,
          complete: true,
          error
        }
      }
      break
  }

  return state
}
