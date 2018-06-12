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

export function caseStatusToClass(status) {
  var statuses = {
    0: 'default',
    1: 'info',
    2: 'danger',
    3: 'warning',
    4: 'info',
    5: 'default',
    6: 'default',
    7: 'warning',
    8: 'warning',
    9: 'info',
    10: 'danger',
    11: 'success'
  }
  return statuses[status]
}
