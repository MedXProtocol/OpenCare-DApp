module.exports = function (statusString) {
  var statusMap = {
    None: 0,
    Open: 1,
    Evaluating: 4,
    Evaluated: 5,
    Closed: 6,
    Challenged: 7,
    Challenging: 9,
    ClosedRejected: 10,
    ClosedConfirmed: 11
  }
  var status = statusMap[statusString]
  if (!status) { throw new Error('Unknown status: ', statusString) }
  return status
}
