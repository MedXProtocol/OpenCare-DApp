export function doctorCaseStatusToName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Evaluating',
    3: 'Evaluated',
    4: 'Closed',
    5: 'Evaluated',
    6: 'Evaluating',
    7: 'Diagnosis Rejected',
    8: 'Diagnosis Confirmed'
  }
  return statuses[status]
}

export function doctorCaseStatusToClass(status) {
  var statuses = {
    0: 'default',
    1: 'info',
    2: 'danger',
    3: 'warning',
    4: 'default',
    5: 'default',
    6: 'default',
    7: 'warning',
    8: 'danger'
  }
  return statuses[status]
}
