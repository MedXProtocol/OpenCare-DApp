import {
  takeEvery,
  call,
  getContext,
  select,
  put
} from 'redux-saga/effects'

function* addSubscription({ address }) {
  const web3 = yield getContext('web3')
  const listener = yield select(state => state.sagaGenesis.logs[address])
  if (!listener || !listener.pastLogsLoaded) {
    const pastLogs = yield call([web3.eth, 'getPastLogs'], { fromBlock: '0', toBlock: 'latest', address })
    yield put({ type: 'PAST_LOGS', address, logs: pastLogs })
  }
}

function* checkReceiptForEvents({ receipt }) {
  yield receipt.logs.map(function* (log) {
    const logs = yield select(state => state.sagaGenesis.logs[log.address])
    if (logs) {
      yield put({ type: 'NEW_LOGS', address: log.address, log })
    }
  })
}

export function* logSaga() {
  yield takeEvery('ADD_LOG_LISTENER', addSubscription)
  yield takeEvery('BLOCK_TRANSACTION_RECEIPT', checkReceiptForEvents)
}
