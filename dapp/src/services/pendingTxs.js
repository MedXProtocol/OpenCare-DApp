import React from 'react'
import { CaseRow } from '~/components/CaseRow'
import { defined } from '~/utils/defined'
import forOwn from 'lodash.forown'

const PENDING_TX_STATUS = -1

// Adds cases not yet committed to the blockchain to the cases array set in the mapStateToProps
// Contains info about pending tx's
export const addPendingTxs = function(caseRows, transactions, caseCount) {
  let objIndex = caseCount + 1

  forOwn(transactions, function(transaction, transactionId) {
    if (!defined(transaction.call)) { return } // continue

    const { confirmed, error, call } = transaction
    const method = call.method

    const isNewPatientCase = (method === 'approveAndCall')

    // A tx we care about
    if (isNewPatientCase && (defined(error))) {
    // if (isNewPatientCase && (!confirmed || defined(error))) {
      const caseRowObject = {
        ...transaction,
        transactionId,
        objIndex
      }
      caseRows.splice(0, 0, (
        <CaseRow
          caseRowObject={caseRowObject}
          objIndex={objIndex}
          key={`new-case-row-${objIndex}`}
          context='patient'
        />
      ))

      objIndex++
    }
  })

  return caseRows
}

// Updates the cases array set in the mapStateToProps with any information about pending
// tx's for this Case
export const updatePendingTx = function(caseRowObject, transaction, transactionId) {
  const { confirmed, error, call } = transaction
  const method = { call }

  const isAccepting = (method === 'acceptDiagnosis' || method === 'acceptAsDoctorAfterADay')
  const isSecondOpinion = (method === 'challengeWithDoctor')
  const isDiagnosis = (method === 'diagnoseCase' || method === 'diagnoseChallengedCase')

  // A tx we care about
  if ((isAccepting || isSecondOpinion || isDiagnosis) && (!confirmed || defined(error))) {
    return {
      ...caseRowObject,
      ...transaction,
      transactionId,
      status: PENDING_TX_STATUS // 'pending' tx state, before it's confirmed on the blockchain
    }
  } else {
    return caseRowObject
  }
}
