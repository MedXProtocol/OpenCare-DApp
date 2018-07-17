export default function (state, { type, transactionId, txType, txHash }) {
  if (typeof state === 'undefined') {
    state = {
      transactions: []
    }
  }

  switch (type) {
    case 'ADD_EXTERNAL_TRANSACTION':
      const newTx = {
        transactionId,
        txType,
        txHash,
        inFlight: true
      }
      state = {
        ...state,
        transactions: [
          ...state.transactions,
          newTx
        ]
      }
      break

    case 'EXTERNAL_TRANSACTION_SUCCESS':
      state = {
        ...state,
        transactions: state.transactions.map( (item, index) => {
          if (item.transactionId !== transactionId) { return item }

          return {
            transactionId,
            txType,
            txHash,
            inFlight: false,
            success: true
          }
        })
      }
      break

    case 'EXTERNAL_TRANSACTION_ERROR':
      state = {
        ...state,
        transactions: state.transactions.map( (item, index) => {
          if (item.transactionId !== transactionId) { return item }

          return {
            transactionId,
            txType,
            txHash,
            inFlight: false,
            success: false
          }
        })
      }
      break

    case 'SIGNED_OUT':
      state = {
        transactions: []
      }
      break

    // no default
  }

  return state
}
