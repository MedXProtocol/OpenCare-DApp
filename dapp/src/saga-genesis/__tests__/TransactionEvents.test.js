import { TransactionEvents } from '../TransactionEvents'

describe('CallCountRegistry', () => {
  describe('onError()', () => {
    it('should call onError when an error occurs', () => {
      const events = new TransactionEvents()
      let calledError = false
      events.check({ foo: 'bar' }).onError(() => calledError = true)
      expect(calledError).toBeFalsy()
      events.check({ error: 'firstError' }).onError(err => calledError = err)
      expect(calledError).toEqual('firstError')
      events.check({ error: 'secondError' }).onError(err => calledError = err)
      expect(calledError).toEqual('firstError')
    })
  })

  describe('onReceipt()', () => {
    it('should call onReceipt when a receipt is available', () => {
      const events = new TransactionEvents()
      let receipt = false
      events.check({ foo: 'bar' }).onReceipt(() => receipt = true)
      expect(receipt).toBeFalsy()
      events.check({ receipt: 'firstReceipt' }).onReceipt(_receipt => receipt = _receipt)
      expect(receipt).toEqual('firstReceipt')
      events.check({ receipt: 'secondReceipt' }).onReceipt(_receipt => receipt = _receipt)
      expect(receipt).toEqual('firstReceipt')
    })
  })
})
