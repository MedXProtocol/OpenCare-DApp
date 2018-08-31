import { caseStale } from '~/services/caseStale'
import { caseStatus } from '~/utils/caseStatus'

export const doesNotRequireAttention = function(
  address,
  diagnosingDoctor,
  updatedAt,
  status,
  secondsInADay
) {
  if (!address || !diagnosingDoctor || !updatedAt || !status || !secondsInADay) { return false }

  const isFirstDoc = address === diagnosingDoctor

  const isStale = caseStale(updatedAt, status, 'doctor', secondsInADay)

  if (isFirstDoc) {
    return (status !== caseStatus('Evaluating')) && !isStale
  } else {
    return (status !== caseStatus('Challenging')) && !isStale
  }
}
