import { caseStatus } from '~/utils/caseStatus'

const statusNames = {
  0: 'None',
  1: 'Open',
  2: 'Requires Evaluation',
  3: 'Awaiting Patient',
  4: 'Closed',
  5: 'Awaiting Patient',
  6: 'Requires Evaluation',
  7: 'Diagnosis Rejected',
  8: 'Diagnosis Confirmed'
}

var statusClasses = {
  0: 'default',
  1: 'info',
  2: 'warning',
  3: 'default',
  4: 'default',
  5: 'default',
  6: 'warning',
  7: 'default',
  8: 'default'
}

// This is context specific, and will say what state the case is in depending on
// which doc is viewing the case
export function doctorCaseStatusToName(caseObject) {
  let statusName
  const evaluatedState = statusNames[caseStatus('Evaluated')]
  const { isFirstDoc, status } = caseObject

  if (
       status === caseStatus('Closed')
    || status === caseStatus('ClosedRejected')
    || status === caseStatus('ClosedConfirmed')
  )
    statusName = statusNames[caseStatus('Closed')]
  else if (isFirstDoc && status > caseStatus('Evaluating'))
    statusName = evaluatedState
  else
    statusName = statusNames[status]

  return statusName
}

// This is context specific, and will provide a different result depending on
// which doc is viewing the case
export function doctorCaseStatusToClass(caseObject) {
  let statusClass
  const evaluatedState = statusClasses[caseStatus('Evaluated')]
  const { isFirstDoc, status } = caseObject

  if (isFirstDoc && status === caseStatus('Closed'))
    statusClass = statusClasses[caseStatus('Closed')]
  else if (isFirstDoc && status > caseStatus('Evaluating'))
    statusClass = evaluatedState
  else if (!isFirstDoc && status > caseStatus('Challenging'))
    statusClass = evaluatedState
  else
    statusClass = statusClasses[status]

  return statusClass
}
