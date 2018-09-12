import {
  contractByName,
  cacheCallValue
} from '~/saga-genesis'

export function mapStateToCase(state, { caseAddress }) {
  const CasePaymentManager = contractByName(state, 'CasePaymentManager')
  const tokenContract = cacheCallValue(state, CasePaymentManager, 'getCaseTokenContract', caseAddress)
  const caseFee = cacheCallValue(state, caseAddress, 'caseFee')

  return {
    CasePaymentManager,
    tokenContract,
    caseFee
  }
}
