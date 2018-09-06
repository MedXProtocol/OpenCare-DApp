import { takeEvery } from 'redux-saga/effects'
import { transactionErrorToCode } from '~/services/transactionErrorToCode'
import { bugsnagClient } from '~/bugsnagClient'

function logError({ transactionId, error, call }) {
  const errorCode = transactionErrorToCode(error)

  if (errorCode !== 'userRevert') {
    bugsnagClient.notify(
      {
        name: `TransactionError`,
        message: `${call.toString()}: ${errorCode}: ${error}`,
        transactionId,
        error
      }
    )
  }
}

export function* failedTransactionListener() {
  yield takeEvery('TRANSACTION_ERROR', logError)
}
