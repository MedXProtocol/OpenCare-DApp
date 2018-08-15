const SECONDS_IN_A_DAY = 86400

export function caseStaleForOneDay(updatedAt, status) {
  if (!updatedAt) {
    return false
  } else {
    const waitingOnPatient = (status === 3)
    const hasBeenOneDay = (
      (Math.floor(Date.now() / 1000) - updatedAt) > SECONDS_IN_A_DAY
    )

    return waitingOnPatient && hasBeenOneDay
  }
}
