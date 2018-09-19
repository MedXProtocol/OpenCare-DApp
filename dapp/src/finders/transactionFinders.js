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
    })
  }
}
