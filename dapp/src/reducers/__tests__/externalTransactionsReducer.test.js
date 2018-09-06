import externalTransactionsReducer from '../externalTransactionsReducer'

describe('externalTransactionsReducer', () => {

  const transactionId = '1'
  const txType = 'txType'
  const txHash = 'txHash'
  const call = { address: 'callAddress', method: 'callMethod' }
  const props = { transactionId, txType, txHash, call }

  describe('ADD_EXTERNAL_TRANSACTION', () => {
    it('should create a new tx', () => {
      expect(externalTransactionsReducer(undefined, {...props, type: 'ADD_EXTERNAL_TRANSACTION', })).toEqual({
        transactions: [
          {
            transactionId,
            txType,
            txHash,
            call,
            inFlight: true
          }
        ]
      })
    })
  })

  describe('EXTERNAL_TRANSACTION_SUCCESS', () => {
    it('should update the tx', () => {
      const state = {
        transactions: [
          {
            transactionId: '2'
          },
          {
            transactionId,
            txType,
            txHash,
            call,
            inFlight: true
          }
        ]
      }
      expect(externalTransactionsReducer(state, {...props, type: 'EXTERNAL_TRANSACTION_SUCCESS', })).toEqual({
        transactions: [
          {
            transactionId: '2'
          },
          {
            transactionId,
            txType,
            txHash,
            call,
            inFlight: false,
            success: true
          }
        ]
      })
    })
  })


  describe('EXTERNAL_TRANSACTION_ERROR', () => {
    it('should update the tx', () => {
      const state = {
        transactions: [
          {
            transactionId: '2'
          },
          {
            transactionId,
            txType,
            txHash,
            call,
            inFlight: true
          }
        ]
      }
      expect(externalTransactionsReducer(state, {...props, type: 'EXTERNAL_TRANSACTION_ERROR', })).toEqual({
        transactions: [
          {
            transactionId: '2'
          },
          {
            transactionId,
            txType,
            txHash,
            call,
            inFlight: false,
            success: false
          }
        ]
      })
    })
  })
})
