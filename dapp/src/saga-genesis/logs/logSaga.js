import {
  call,
  all,
  select,
  fork,
  put
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'
import {
  takeSequentially
} from '~/saga-genesis/utils/takeSequentially'
import { customProviderWeb3 } from '~/utils/customProviderWeb3'
import { web3NetworkId } from '~/saga-genesis/web3/web3-sagas'

const MAX_RETRIES = 50

function* addSubscription({ address, fromBlock }) {
  address = address.toLowerCase()
  yield put({ type: 'LOG_LISTENER_ADDED', address })
  const listener = yield select(state => state.sagaGenesis.logs[address])

  if (listener.count === 1) {
    const networkId = yield web3NetworkId()
    const web3 = customProviderWeb3(networkId)
    const fromBlockHex = web3.utils.toHex(fromBlock || 0)

    for (let i = 0; i < MAX_RETRIES; i++) {
      const pastLogs = yield call([web3.eth, 'getPastLogs'], { fromBlock: fromBlockHex, toBlock: 'latest', address })

      if (pastLogs) {
        yield put({ type: 'PAST_LOGS', address, logs: pastLogs })
      } else if (i > MAX_RETRIES) {
        // attempts failed after 50 x 2secs
        throw new Error('Unable to get pastLogs from network');
      } else {
        yield call(delay, 2000)
      }
    }
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
  yield fork(takeSequentially, 'ADD_LOG_LISTENER', addSubscription)
  yield fork(takeSequentially, 'BLOCK_TRANSACTION_RECEIPT', checkReceiptForEvents)
}
