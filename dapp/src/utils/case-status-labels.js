export function caseStatusToName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Evaluating',
    3: 'Evaluated',
    4: 'Closed',
    5: 'Challenged',
    6: 'Challenging',
    7: 'Diagnosis Rejected',
    8: 'Diagnosis Confirmed'
  }
  return statuses[status]
}

export function caseStatusToClass(status) {
  var statuses = {
    0: 'default',
    1: 'info',
    2: 'warning',
    3: 'info',
    4: 'default',
    5: 'warning',
    6: 'info',
    7: 'danger',
    8: 'success'
  }
  return statuses[status]
}
