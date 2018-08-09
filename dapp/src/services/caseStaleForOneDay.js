// const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_DAY = 40

export function caseStaleForOneDay(createdAt, status) {
  if (!createdAt) {
    return false
  } else {
    const waitingOnPatient = (status === '3')
    const hasBeenOneDay = (
      (Math.floor(Date.now() / 1000) - createdAt) > SECONDS_IN_A_DAY
    )

    return waitingOnPatient && hasBeenOneDay
  }
}
