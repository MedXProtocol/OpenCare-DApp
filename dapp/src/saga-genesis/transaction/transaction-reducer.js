import update from 'immutability-helper';

export default function (state, {type, transactionId, call, error, receipt}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'SEND_TRANSACTION':
      state = {
        ...state,
        [transactionId]: {
          ...state[transactionId],
          call,
          inFlight: true
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
          confirmed: true
        }
      }

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

    case 'TRANSACTION_REJECTED_BY_USER':
      state = update(state, {
        $unset: [transactionId]
      })
      break
  }

  return state
}
