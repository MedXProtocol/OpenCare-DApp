export function patientCaseStatusToName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Under Review',
    3: 'Evaluated',
    4: 'Closed',
    5: 'Challenged',
    6: 'Challenging',
    7: 'Diagnosis Received',
    8: 'Diagnosis Confirmed'
  }
  return statuses[status]
}

export function patientCaseStatusToClass(status) {
  var statuses = {
    0: 'default',
    1: 'info',
    2: 'info',
    3: 'warning',
    4: 'default',
    5: 'warning',
    6: 'info',
    7: 'success',
    8: 'success'
  }
  return statuses[status]
}
