export function caseStatusToName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Canceled',
    3: 'Pending Approval',
    4: 'Evaluating',
    5: 'Evaluated',
    6: 'Closed',
    7: 'Challenged',
    8: 'Pending Approval',
    9: 'Challenging',
    10: 'Diagnosis Rejected',
    11: 'Diagnosis Confirmed'
  }
  return statuses[status]
}
