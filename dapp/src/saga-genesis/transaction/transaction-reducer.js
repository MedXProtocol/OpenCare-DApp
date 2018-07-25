export default function (state, { type, transactionId, call, error, receipt, gasUsed, txHash, confirmationNumber }) {
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
          call,
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
          confirmed: true,
          receipt
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
          error,
          gasUsed
        }
      }
      break

    case 'SIGNED_OUT':
      state = {}
      break

    case 'REMOVE_TRANSACTION':
      delete state[transactionId]
      break

    // no default
  }

  return state
}
