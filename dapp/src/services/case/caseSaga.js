import {
  cacheCall
} from 'saga-genesis'

export function* caseSaga({ caseAddress, CasePaymentManager }) {
  if (!caseAddress || !CasePaymentManager) { return }
  yield cacheCall(CasePaymentManager, 'getCaseTokenContract', caseAddress)
  yield cacheCall(caseAddress, 'caseFee')
}
