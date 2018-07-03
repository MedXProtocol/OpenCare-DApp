module.exports = function (statusString) {
  var statusMap = {
    None: 0,
    Open: 1,
    Evaluating: 3,
    Evaluated: 4,
    Closed: 5,
    Challenged: 6,
    Challenging: 8,
    ClosedRejected: 10,
    ClosedConfirmed: 11
  }
  var status = statusMap[statusString]
  if (!status) { throw new Error('Unknown status: ', statusString) }
  return status
}
