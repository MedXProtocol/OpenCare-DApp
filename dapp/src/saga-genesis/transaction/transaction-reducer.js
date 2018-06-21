export default function (state, {type, transactionId, call, error, receipt, txHash}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'SEND_TRANSACTION':
      state = {
        ...state,
        [transactionId]: {
          call,
          inFlight: true
        }
      }
      break

    case 'TRANSACTION_HASH':
      state = {
        ...state,
        [transactionId]: {
          ...state[transactionId],
          inFlight: false,
          submitted: true,
          txHash
        }
      }
      break

    case 'TRANSACTION_RECEIPT':
      state = {
        ...state,
        [transactionId]: {
          ...state[transactionId],
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
          ...state[transactionId],
          call,
          confirmed: true
        }
      }
      break

    case 'TRANSACTION_ERROR':
      state = {
        ...state,
        [transactionId]: {
          ...state[transactionId],
          inFlight: false,
          complete: true,
          error
        }
      }
      break

    case 'TRANSACTIONS_CLEAR':
      state = {}
      break

    // no default
  }

  return state
}
