import {
  put,
  takeEvery,
  getContext,
  select,
  take,
  fork
} from 'redux-saga/effects'
import {
  eventChannel,
  END
} from 'redux-saga'
import {
  contractKeyByAddress
} from '../state-finders'
import PollingBlockTracker from 'eth-block-tracker'

function createBlockTrackerEmitter (web3) {
  return eventChannel(emit => {
    const blockTracker = new PollingBlockTracker({provider: web3.currentProvider})

    blockTracker.on('latest', (block) => {
      emit({type: 'BLOCK_LATEST', block})
    })

    blockTracker.start().catch((error) => {
      emit({type: 'BLOCK_TRACKER_FAILED', error})
      emit(END)
    })

    return () => {
      blockTracker.stop()
    }
  })
}

function* startBlockTracker () {
  const web3 = yield getContext('web3')
  const channel = createBlockTrackerEmitter(web3)
  while (true) {
    yield put(yield take(channel))
  }
}

export function* latestBlock({block}) {
  const web3 = yield getContext('web3')
  const addressSet = new Set()
  const addAddress = function* (address) {
    if (!address) { return false }
    const contractKey = yield select(contractKeyByAddress, address)
    if (contractKey) {
      addressSet.add(address)
      return true
    }
    return false
  }
  yield* block.transactions.map(function* (addressSet, transaction) {
    const to = yield addAddress(transaction.to)
    const from = yield addAddress(transaction.from)
    if (to || from) {
      const receipt = yield web3.eth.getTransactionReceipt(transaction.hash)
      yield* receipt.logs.map(function* (log) {
        yield addAddress(log.address)
      })
    }
  })

  yield* Array.from(addressSet).map(function* (address) {
    yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export default function* () {
  yield takeEvery('BLOCK_LATEST', latestBlock)
  yield fork(startBlockTracker)
}
