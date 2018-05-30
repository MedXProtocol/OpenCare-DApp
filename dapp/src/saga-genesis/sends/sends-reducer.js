export default function (state, {type, transactionId, call, error, receipt}) {
  if (typeof state === 'undefined') {
    state = {
      transactions: {}
    }
  }

  switch (type) {
    case 'WEB3_SEND':
      state = {
        transactions: {
          ...state.transactions,
          [transactionId]: {
            inFlight: true
          }
        }
      }
      break

    case 'WEB3_SEND_RETURN':
      state = {
        transactions: {
          ...state.transactions,
          [transactionId]: {
            inFlight: false,
            complete: true,
            receipt
          }
        }
      }
      break

    case 'WEB_SEND_ERROR':
      state = {
        transactions: {
          ...state.transactions,
          [transactionId]: {
            inFlight: false,
            complete: true,
            error
          }
        }
      }
      break
  }

  return state
}
