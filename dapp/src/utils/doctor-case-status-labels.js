const statusNames = {
  0: 'None',
  1: 'Open',
  2: 'Canceled',
  3: 'Pending Approval',
  4: 'Evaluating',
  5: 'Evaluated',
  6: 'Closed',
  7: 'Evaluated',
  8: 'Pending Approval',
  9: 'Evaluating',
  10: 'Diagnosis Sent',
  11: 'Diagnosis Confirmed'
}

var statusClasses = {
  0: 'default',
  1: 'info',
  2: 'danger',
  3: 'info',
  4: 'warning',
  5: 'default',
  6: 'default',
  7: 'default',
  8: 'info',
  9: 'warning',
  10: 'default',
  11: 'success'
}

// This is context specific, and will say what state the case is in depending on
// which doc is viewing the case
export function doctorCaseStatusToName(isFirstDoc, status) {
  let statusName
  let evaluatedState = statusNames[5]

  if (isFirstDoc && status > 5)
    statusName = evaluatedState
  else if (!isFirstDoc && status > 9)
    statusName = evaluatedState
  else
    statusName = statusNames[status]

  return statusName
}

// This is context specific, and will provide a different result depending on
// which doc is viewing the case
export function doctorCaseStatusToClass(isFirstDoc, status) {
  let statusClass
  let evaluatedState = statusClasses[5]

  if (isFirstDoc && status > 5)
    statusClass = evaluatedState
  else if (!isFirstDoc && status > 9)
    statusClass = evaluatedState
  else
    statusClass = statusClasses[status]

  return statusClass
}
