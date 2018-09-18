import get from 'lodash.get'

export const transactionFinders = {
  createAndAssignCase (state) {
    const txs = Object.values(get(state, 'sagaGenesis.transactions'))

    return txs.filter((tx) => {
      return (tx.call && (
           tx.call.method === 'createAndAssignCase'
        || tx.call.method === 'createAndAssignCaseWithPublicKey'
      ))
    })
  }
}
