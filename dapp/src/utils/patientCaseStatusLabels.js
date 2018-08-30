export function patientCaseStatusToName(caseRowObject) {
  const statuses = {
    0: 'None',
    1: 'Open',
    2: 'Doctor Reviewing',
    3: 'Evaluated, Please Review',
    4: 'Closed',
    5: '2nd Doctor Reviewing',
    6: 'Diagnosis Received',
    7: 'Diagnosis Confirmed'
  }
  return statuses[caseRowObject.status]
}

export function patientCaseStatusToClass(caseRowObject) {
  const statuses = {
    0: 'default',
    1: 'info',
    2: 'info',
    3: 'warning',
    4: 'default',
    5: 'info',
    6: 'success',
    7: 'success'
  }
  return statuses[caseRowObject.status]
}
