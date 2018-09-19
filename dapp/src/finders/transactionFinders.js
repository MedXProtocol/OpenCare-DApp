export const transactionFinders = {
  diagnoseCase (state, caseAddress) {
    Object.values(state.sagaGenesis.transactions).find(transaction => {
      const { method, args } = transaction.call
      return method === 'diagnoseCase' && args[0] === caseAddress
    })
  },

  diagnoseChallengedCase (state, caseAddress) {
    Object.values(state.sagaGenesis.transactions).find(transaction => {
      const { method, args } = transaction.call
      return method === 'diagnoseChallengedCase' && args[0] === caseAddress
  }),

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
