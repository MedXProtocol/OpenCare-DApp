import { caseStatus } from '~/utils/caseStatus'

const staleStatuses = [
  caseStatus('Evaluating'),
  caseStatus('Evaluated'),
  caseStatus('Challenging')
]

// Intial doc can take action after 2 days
// Intial doc can take action after 4 days when the case has been challenged
// Patient after 1 day

// secondsRequired is the amount of time we want to compare by
//   (eg. 86400 seconds will evaluate to true 1 day after the compareTime)
// compareTime would typically be a record's createdAt or updatedAt unix timestamp (UTC)
// status is CaseStatus (Open, Closed, Evaluated, etc)
// context is 'patient' or 'doctor'
export function caseStale(compareTime, status, context, secondsInADay, currentTime) {
  if (!compareTime || !status) {
    return false
  } else if (!staleStatuses.includes(status)) {
    return false
  } else {
    let secondsRequired = secondsInADay

    const isPatient = (context === 'patient')
    const waitingOnDoctor = (
         status === caseStatus('Evaluating')
      || status === caseStatus('Challenging')
    )
    const waitingOnPatient = (
        status === caseStatus('Evaluated')
     || status === caseStatus('Challenging')
    )

    if (!isPatient) {
      if (status === caseStatus('Challenging')) {
        secondsRequired = (secondsInADay * 4)
      } else {
        secondsRequired = (secondsInADay * 2)
      }
    }

    const enoughTimeHasPassed = (
      (currentTime - compareTime) > secondsRequired
    )

    return enoughTimeHasPassed && ((isPatient && waitingOnDoctor) || (!isPatient && waitingOnPatient))
  }
}
