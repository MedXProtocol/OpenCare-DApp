import { transactionFinders } from '../transactionFinders'

describe('transactionFinders', () => {
  describe('diagnoseCase()', () => {
    it('should retrieve a diagnose case method', () => {
      const transaction = {
        call: {
          method: 'diagnoseCase',
          args: ['0x1234']
        }
      }

      const state = {
        sagaGenesis: {
          transactions: [
            transaction
          ]
        }
      }

      expect(transactionFinders.diagnoseCase(state, '0x1234')).toBe(transaction)
    })
  })

  describe('diagnoseChallengedCase()', () => {
    it('should retrieve a diagnose case method', () => {
      const transaction = {
        call: {
          method: 'diagnoseChallengedCase',
          args: ['0x1234']
        }
      }

      const state = {
        sagaGenesis: {
          transactions: [
            transaction
          ]
        }
      }

      expect(transactionFinders.diagnoseChallengedCase(state, '0x1234')).toBe(transaction)
    })
  })
})
