import { caseStale } from '~/services/caseStale'

export const isCaseRequiringDoctorsAttention = function(isFirstDoc, updatedAt, status) {
  return (
    (isFirstDoc && status === 2)
    || (!isFirstDoc && status === 6)
    || (isFirstDoc && caseStale(updatedAt, status, 'doctor'))
  )
}
