import {
  contractByName,
  cacheCallValue
} from 'saga-genesis'

export function mapStateToCase(state, { caseAddress }) {
  const CasePaymentManager = contractByName(state, 'CasePaymentManager')
  let tokenContract = cacheCallValue(state, CasePaymentManager, 'getCaseTokenContract', caseAddress)
  const caseFee = cacheCallValue(state, caseAddress, 'caseFee')

  if (tokenContract) {
    tokenContract = tokenContract.toLowerCase()
  }

  return {
    CasePaymentManager,
    tokenContract,
    caseFee,
    caseAddress
  }
}
