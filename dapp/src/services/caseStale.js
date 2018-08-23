// secondsElapsed is the amount of time we want to compare by
//   (eg. 86400 seconds will evaluate to true 1 day after the compareTime)
// compareTime would typically be a record's createdAt or updatedAt unix timestamp (UTC)
// status is CaseStatus (Open, Closed, Evaluated, etc)
// isPatient is true if this is the patient context, false if from the doctor's point of view
export function caseStale(secondsElapsed, compareTime, status, isPatient) {
  if (!compareTime || !status) {
    return false
  } else {
    const waitingOnDoctor = (status === 2 || status === 6)
    const waitingOnPatient = (status === 3)
    const enoughTimeHasPassed = (
      (Math.floor(Date.now() / 1000) - compareTime) > secondsElapsed
    )

    return enoughTimeHasPassed && ((isPatient && waitingOnDoctor) || (!isPatient && waitingOnPatient))
  }
}
