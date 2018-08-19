import { secondsInADay } from '~/config/constants'
import { caseStale } from '~/services/caseStale'

export const isCaseRequiringDoctorsAttention = function(isFirstDoc, updatedAt, status) {
  return (
    (isFirstDoc && status === 2)
    || (!isFirstDoc && status === 6)
    || (isFirstDoc && caseStale(secondsInADay, updatedAt, status))
  )
}
