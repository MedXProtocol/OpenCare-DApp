import { caseStale } from '~/services/caseStale'
import { caseStatus } from '~/utils/caseStatus'

export const isCaseRequiringDoctorsAttention = function(
  isFirstDoc,
  updatedAt,
  status,
  secondsInADay
) {
  return (
       (isFirstDoc && status === caseStatus('Closed'))
    || (!isFirstDoc && status === caseStatus('Challenging'))
    || (isFirstDoc && caseStale(updatedAt, status, 'doctor', secondsInADay))
  )
}
