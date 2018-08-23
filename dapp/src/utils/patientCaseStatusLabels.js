export function patientCaseStatusToName(caseRowObject) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Doctor Reviewing',
    3: 'Evaluated, Please Review',
    4: 'Closed',
    5: 'Challenged',
    6: '2nd Doctor Reviewing',
    7: 'Diagnosis Received',
    8: 'Diagnosis Confirmed'
  }
  return statuses[caseRowObject.status]
}

export function patientCaseStatusToClass(caseRowObject) {
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
  return statuses[caseRowObject.status]
}
