import { SECONDS_IN_A_DAY } from '~/config/constants'

// Intial doc can take action after 2 days
// Intial doc can take action after 4 days when the case has been challenged
// Patient after 1 day

// secondsElapsed is the amount of time we want to compare by
//   (eg. 86400 seconds will evaluate to true 1 day after the compareTime)
// compareTime would typically be a record's createdAt or updatedAt unix timestamp (UTC)
// status is CaseStatus (Open, Closed, Evaluated, etc)
// context is 'patient' or 'doctor'
export function caseStale(compareTime, status, context) {
  if (!compareTime || !status) {
    return false
  } else {
    let secondsElapsed = SECONDS_IN_A_DAY

    const isPatient = (context === 'patient')
    const waitingOnDoctor = (status === 2 || status === 6)
    const waitingOnPatient = (status === 3)

    if (!isPatient) {
      secondsElapsed = (status === 6) ? (SECONDS_IN_A_DAY * 4) : (SECONDS_IN_A_DAY * 2)
    }

    const enoughTimeHasPassed = (
      (Math.floor(Date.now() / 1000) - compareTime) > secondsElapsed
    )

    return enoughTimeHasPassed && ((isPatient && waitingOnDoctor) || (!isPatient && waitingOnPatient))
  }
}
