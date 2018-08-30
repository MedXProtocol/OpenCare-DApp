export const caseStatus = function (statusString) {
  var statusMap = {
    Pending: -1,
    None: 0,
    Open: 1,
    Evaluating: 2,
    Evaluated: 3,
    Closed: 4,
    Challenging: 5,
    ClosedRejected: 6,
    ClosedConfirmed: 7
  }
  var status = statusMap[statusString]
  if (!status) { throw new Error('Unknown status: ', statusString) }
  return status
}
