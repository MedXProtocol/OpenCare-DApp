import {
  takeEvery,
  call,
  getContext,
  select,
  put
} from 'redux-saga/effects'

function* addSubscription({ address }) {
  const listener = yield select(state => state.sagaGenesis.logs[address])
  if (!listener.logsFetched) {
    yield put({ type: 'FETCH_PAST_LOGS', address })
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

function* fetchPastLogs({ address }) {
  const web3 = yield getContext('web3')
  const pastLogs = yield call([web3.eth, 'getPastLogs'], { fromBlock: '0', toBlock: 'latest', address })
  yield put({ type: 'PAST_LOGS', address, logs: pastLogs })
}

export function* logSaga() {
  yield takeEvery('ADD_LOG_LISTENER', addSubscription)
  yield takeEvery('BLOCK_TRANSACTION_RECEIPT', checkReceiptForEvents)
  yield takeEvery('FETCH_PAST_LOGS', fetchPastLogs)
}
