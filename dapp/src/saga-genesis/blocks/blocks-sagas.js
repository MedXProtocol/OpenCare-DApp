import {
  put,
  takeEvery,
  getContext,
  fork
} from 'redux-saga/effects'
import {
  eventChannel,
  delay,
  END
} from 'redux-saga'
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
  // console.log(block)
  const addresses = block.transactions.reduce((addressSet, transaction) => {
    addressSet.add(transaction.to)
    return addressSet.add(transaction.from)
  }, new Set())
  yield* Array.from(addresses).map(function* (address) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export default function* () {
  yield takeEvery('BLOCK_LATEST', latestBlock)
  yield fork(startBlockTracker)
}
