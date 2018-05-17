export function caseStatusToName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Pending Approval',
    3: 'Evaluating',
    4: 'Evaluated',
    5: 'Closed',
    6: 'Challenged',
    7: 'Pending Approval',
    8: 'Challenging',
    9: 'Canceled',
    10: 'Diagnosis Rejected',
    11: 'Diagnosis Confirmed'
  }
  return statuses[status]
}
