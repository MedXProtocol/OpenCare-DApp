import { defined } from '~/utils/defined'

const PENDING_TX_STATUS = -1

// Adds cases not yet committed to the blockchain to the cases array set in the mapStateToProps
// Contains info about pending tx's
export const addPendingTx = function(transaction, objIndex) {
  let caseRowObject
  const { confirmed, error, call } = transaction
  const isNewPatientCase = (call.method === 'approveAndCall')

  // TODO: Find a way to only fade this out after a few seconds
  // A tx we care about
  if (isNewPatientCase && (!confirmed || defined(error))) {
    caseRowObject = {
      ...transaction,
      objIndex
    }
  }
  return caseRowObject
}

// Updates the cases array set in the mapStateToProps with any information about pending
// tx's for this Case
export const updatePendingTx = function(caseRowObject, transaction) {
  const method = transaction.call.method
  const isAccepting = (method === 'acceptDiagnosis' || method === 'acceptAsDoctor')
  const isSecondOpinion = (method === 'challengeWithDoctor')
  const isDiagnosis = (method === 'diagnoseCase' || method === 'diagnoseChallengedCase')

  // A tx we care about
  if (isAccepting || isSecondOpinion || isDiagnosis) {
    return {
      ...caseRowObject,
      ...transaction,
      status: PENDING_TX_STATUS // 'pending' tx state, before it's confirmed on the blockchain
    }
  } else {
    return caseRowObject
  }
}
