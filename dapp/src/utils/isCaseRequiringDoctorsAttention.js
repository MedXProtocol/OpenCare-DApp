import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'

export const isCaseRequiringDoctorsAttention = function(isFirstDoc, updatedAt, status) {
  console.log(isFirstDoc, status, updatedAt)
  console.log(typeof status)

  return (
    (isFirstDoc && status === 2)
    || (!isFirstDoc && status === 6)
    || (isFirstDoc && caseStaleForOneDay(updatedAt, status))
  )
}
