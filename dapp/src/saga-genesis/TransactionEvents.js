export class TransactionEvents {
  check (transaction) {
    return {
      onError: (cb) => {
        if (!this.hasError && transaction.error) {
          cb(transaction.error)
          this.hasError = true
        }
      },

      onReceipt: (cb) => {
        if (!this.hasReceipt && transaction.receipt) {
          cb(transaction.receipt)
          this.hasReceipt = true
        }
      },

      onConfirmed: (cb) => {
        if (!this.hasConfirmed && transaction.confirmed) {
          cb()
          this.hasConfirmed = true
        }
      }
    }
  }
}
