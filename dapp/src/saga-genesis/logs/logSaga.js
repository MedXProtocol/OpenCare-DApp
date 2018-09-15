import {
  call,
  all,
  getContext,
  select,
  put
} from 'redux-saga/effects'
import {
  takeSequentially
} from '~/saga-genesis/utils/takeSequentially'

function* addSubscription({ address, fromBlock }) {
  address = address.toLowerCase()
  yield put({ type: 'LOG_LISTENER_ADDED', address })
  const listener = yield select(state => state.sagaGenesis.logs[address])
  if (listener.count === 1) {
    const web3 = yield getContext('web3')
    const fromBlockHex = web3.utils.toHex(fromBlock || 0)
    const pastLogs = yield call([web3.eth, 'getPastLogs'], { fromBlock: fromBlockHex, toBlock: 'latest', address })
    yield put({ type: 'PAST_LOGS', address, logs: pastLogs })
  }
}

function* checkReceiptForEvents({ receipt }) {
  yield all(receipt.logs.map(function* (log) {
    const address = log.address.toLowerCase()
    const logs = yield select(state => state.sagaGenesis.logs[address])
    if (logs) {
      yield put({ type: 'NEW_LOG', address, log })
    }
  }))
}

export function* logSaga() {
  yield takeSequentially('ADD_LOG_LISTENER', addSubscription)
  yield takeSequentially('BLOCK_TRANSACTION_RECEIPT', checkReceiptForEvents)
}
