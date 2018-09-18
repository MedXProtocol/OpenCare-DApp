import get from 'lodash.get'

export const transactionFinders = {
  createAndAssignCase (state) {
    const txs = Object.values(get(state, 'sagaGenesis.transactions'))

    return txs.filter((tx) => {
      if (tx.call) {
        return (
             tx.call.method === 'createAndAssignCase'
          || tx.call.method === 'createAndAssignCaseWithPublicKey'
        )
      } else {
        return false
      }
    })
  }
}
