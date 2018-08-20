// duration is the amount of time we want to wait before returns true
// caseTime would be createdAt or updatedAt
// status is CaseStatus
export function caseStale(duration, caseTime, status) {
  if (!caseTime || !status) {
    return false
  } else {
    const waitingOnDoctor = (status === 2)
    const waitingOnPatient = (status === 3)
    const durationHasPassed = (
      (Math.floor(Date.now() / 1000) - caseTime) > duration
    )

    return (waitingOnDoctor || waitingOnPatient) && durationHasPassed
  }
}
