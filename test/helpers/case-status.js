module.exports = function (statusString) {
  var statusMap = {
    None: 0,
    Open: 1,
    Evaluating: 2,
    Evaluated: 3,
    Closed: 4,
    Challenged: 5, // unused
    Challenging: 6,
    ClosedRejected: 7,
    ClosedConfirmed: 8
  }
  var status = statusMap[statusString]
  if (!status) { throw new Error('Unknown status: ', statusString) }
  return status
}
