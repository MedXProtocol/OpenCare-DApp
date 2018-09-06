export default function (state, { type, transactionId, txType, txHash, call }) {
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
        call,
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
          item = {...item}
          if (item.transactionId === transactionId) {
            item.inFlight = false
            item.success = true
          }
          return item
        })
      }
      break

    case 'EXTERNAL_TRANSACTION_ERROR':
      state = {
        ...state,
        transactions: state.transactions.map( (item, index) => {
          item = {...item}
          if (item.transactionId === transactionId) {
            item.inFlight = false
            item.success = false
          }
          return item
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
