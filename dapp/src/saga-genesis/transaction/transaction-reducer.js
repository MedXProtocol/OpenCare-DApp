export default function (state, {type, transactionId, call, error, receipt}) {
  if (typeof state === 'undefined') {
    state = {
      transactions: {}
    }
  }

  switch (type) {
    case 'SEND_TRANSACTION':
      state = {
        ...state,
        [transactionId]: {
          inFlight: true,
        }
      }
      break

    case 'TRANSACTION_RETURN':
      state = {
        ...state,
        [transactionId]: {
          inFlight: false,
          complete: true,
          receipt
        }
      }
      break

    case 'TRANSACTION_CONFIRMED':
      state = {
        ...state,
        [transactionId]: {
          confirmed: true
        }
      }

    case 'TRANSACTION_ERROR':
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
