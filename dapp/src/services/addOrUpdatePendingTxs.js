import forOwn from 'lodash.forown'
import { defined } from '~/utils/defined'

const PENDING_TX_STATUS = -1

// Adds cases not yet committed to the blockchain to the cases array set in the mapStateToProps
// Contains info about pending tx's
function addNewCase(cases, transaction, transactionId, objIndex) {
  transaction = {
    ...transaction,
    transactionId,
    objIndex
  }

  cases.splice(0, 0, transaction)

  return cases
}


// Updates the cases array set in the mapStateToProps with any information about pending
// tx's for this Case
function updateCase(cases, transaction, transactionId, caseIndex) {
  cases[caseIndex] = {
    ...cases[caseIndex],
    ...transaction,
    status: PENDING_TX_STATUS, // 'pending' tx state, before it's confirmed on the blockchain
    transactionId
  }

  return cases
}

export const addOrUpdatePendingTxs = function(transactions, cases, caseCount) {
  let index = 0

  forOwn(transactions, function(transaction, transactionId) {
    if (!defined(transaction.call)) { return } // continue

    const { confirmed, error, call } = transaction
    const method = call.method

    const isNewPatientCase = (method === 'approveAndCall')
    const isAccepting = (method === 'acceptDiagnosis' || method === 'acceptAsDoctorAfterADay')
    const isSecondOpinion = (method === 'challengeWithDoctor')
    const isDiagnosis = (method === 'diagnoseCase' || method === 'diagnoseChallengedCase')

    // A tx we care about
    if (!confirmed || defined(error)) {
      // Add new case
      if (isNewPatientCase) {
        const objIndex = parseInt(caseCount, 10) + index
        cases = addNewCase(cases, transaction, transactionId, objIndex)
        index++
      }

      // Update case
      if (isAccepting || isSecondOpinion || isDiagnosis) {
        const caseIndex = cases.findIndex(c => c.caseAddress === transaction.address)
        if (caseIndex >= 0) {
          updateCase(cases, transaction, transactionId, caseIndex)
        }
      }
    }
  })

  return cases
}

