import {
  call,
  fork,
  put,
  select,
  getContext
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'

export function* checkExternalTransactionReceipts(web3) {
  try {
    const transactions = yield select((state) => state.externalTransactions.transactions)

    for (let i = 0; i < transactions.length; i++) {
      const { transactionId, txHash, txType, inFlight, call } = transactions[i]
      if (!inFlight) {
        continue
      }

      const receipt = yield web3.eth.getTransactionReceipt(txHash)

      if (receipt) {
        if (receipt.status) {
          yield put({ type: 'EXTERNAL_TRANSACTION_SUCCESS', transactionId, txType })
          yield put({ type: 'TRANSACTION_CONFIRMED', transactionId, receipt, call })
        } else {
          yield put({ type: 'EXTERNAL_TRANSACTION_ERROR', transactionId, txType })
          yield put({ type: 'TRANSACTION_ERROR', transactionId, call, error: `Possibly sent '${txType}' previously, please contact MedCredits support` })
        }
      } else {
        // console.log('ignoring as not yet mined')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export function* pollTransactions(web3) {
  while (true) {
    yield call(checkExternalTransactionReceipts, web3)
    yield call(delay, 2000)
  }
}

export function* pollExternalTransactionsSaga() {
  const web3 = yield getContext('web3')

  yield fork(pollTransactions, web3)
}
