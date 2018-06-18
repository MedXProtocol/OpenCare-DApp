import { TransactionStateHandler } from '../TransactionStateHandler'

describe('CallCountRegistry', () => {
  describe('onError()', () => {
    it('should call onError when an error occurs', () => {
      const events = new TransactionStateHandler()
      let calledError = false
      events.handle({ foo: 'bar' }).onError(() => calledError = true)
      expect(calledError).toBeFalsy()
      events.handle({ error: 'firstError' }).onError(err => calledError = err)
      expect(calledError).toEqual('firstError')
      events.handle({ error: 'secondError' }).onError(err => calledError = err)
      expect(calledError).toEqual('firstError')
    })
  })

  describe('onReceipt()', () => {
    it('should call onReceipt when a receipt is available', () => {
      const events = new TransactionStateHandler()
      let receipt = false
      events.handle({ foo: 'bar' }).onReceipt(() => receipt = true)
      expect(receipt).toBeFalsy()
      events.handle({ receipt: 'firstReceipt' }).onReceipt(_receipt => receipt = _receipt)
      expect(receipt).toEqual('firstReceipt')
      events.handle({ receipt: 'secondReceipt' }).onReceipt(_receipt => receipt = _receipt)
      expect(receipt).toEqual('firstReceipt')
    })

    it('should allow taking null', () => {
      const events = new TransactionStateHandler()
      let receipt = false
      events.handle(null).onReceipt(() => receipt = true)
      expect(receipt).toBeFalsy()
    })
  })

  describe('chaining()', () => {
    it('should support chaining', () => {
      const events = new TransactionStateHandler()

      let error = false
      let receipt = false

      events.handle({ error: 'ur', receipt: 'rispt' })
        .onError(err => error = err)
        .onReceipt(rec => receipt = rec)

      expect(error).toEqual('ur')
      expect(receipt).toEqual('rispt')
    })
  })
})
