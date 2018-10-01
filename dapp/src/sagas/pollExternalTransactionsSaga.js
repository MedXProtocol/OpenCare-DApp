import {
  call as reduxSagaCall,
  fork,
  put,
  select
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'
import { bugsnagClient } from '~/bugsnagClient'
import { customProviderWeb3 } from '~/utils/customProviderWeb3'

export function* checkExternalTransactionReceipts(web3) {
  try {
    const web3 = yield customProviderWeb3()
    const transactions = yield select((state) => state.externalTransactions.transactions)

    for (let i = 0; i < transactions.length; i++) {
      const { transactionId, txHash, txType, inFlight, call } = transactions[i]
      if (!inFlight) {
        continue
      }

      const receipt = yield reduxSagaCall(web3.eth.getTransactionReceipt, txHash)

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
    bugsnagClient.notify(error)
  }
}

export function* pollTransactions() {
  while (true) {
    yield reduxSagaCall(checkExternalTransactionReceipts)
    yield reduxSagaCall(delay, 2000)
  }
}

export function* pollExternalTransactionsSaga() {
  yield fork(pollTransactions)
}
