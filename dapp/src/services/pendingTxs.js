import { defined } from '~/utils/defined'
import { caseStatus } from '~/utils/caseStatus'

// Adds cases not yet committed to the blockchain to the cases array set in the mapStateToProps
// Contains info about pending tx's
export const addPendingTx = function(transaction, objIndex) {
  let caseRowObject
  const { confirmationNumber, error } = transaction

  // A tx we care about
  if (!confirmationNumber || confirmationNumber < 1 || defined(error)) {
    caseRowObject = {
      ...transaction,
      objIndex
    }
  }
  return caseRowObject
}

// Updates the cases array set in the mapStateToProps with any information about pending
// tx's for this Case
const pendingTxTypes = [
  'acceptDiagnosis',
  'acceptAsDoctor',
  'challengeWithDoctor',
  'diagnoseCase',
  'diagnoseChallengedCase',
  'patientRequestNewInitialDoctor',
  'patientRequestNewChallengeDoctor'
]

export const updatePendingTx = function(caseRowObject, transaction) {
  const method = transaction.call.method

  // 'pending' tx state is -1, before it's confirmed on the blockchain
  if (pendingTxTypes.includes(method)) {
    return {
      ...caseRowObject,
      ...transaction,
      status: caseStatus('Pending')
    }
  } else {
    return caseRowObject
  }
}
