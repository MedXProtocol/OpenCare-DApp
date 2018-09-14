import get from 'lodash.get'

export const externalTransactionFinders = {
  sendDai (state) {
    const externalTransactions = get(state, 'externalTransactions.transactions')
    return externalTransactions.find((tx) => tx.txType === 'sendDai')
  },

  sendEther (state) {
    const externalTransactions = get(state, 'externalTransactions.transactions')
    return externalTransactions.find((tx) => tx.txType === 'sendEther')
  },

  addDoctor (state) {
    const externalTransactions = get(state, 'externalTransactions.transactions')
    return externalTransactions.find((tx) => tx.txType === 'addDoctor')
  }
}
