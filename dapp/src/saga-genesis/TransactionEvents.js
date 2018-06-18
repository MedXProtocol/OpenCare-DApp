export class TransactionEvents {
  check (transaction) {
    return {
      onError: (cb) => {
        if (!this.hasError && transaction && transaction.error) {
          cb(transaction.error)
          this.hasError = true
        }

        return this.check(transaction)
      },

      onReceipt: (cb) => {
        if (!this.hasReceipt && transaction && transaction.receipt) {
          cb(transaction.receipt)
          this.hasReceipt = true
        }

        return this.check(transaction)
      },

      onConfirmed: (cb) => {
        if (!this.hasConfirmed && transaction && transaction.confirmed) {
          cb()
          this.hasConfirmed = true
        }
        
        return this.check(transaction)
      }
    }
  }
}
