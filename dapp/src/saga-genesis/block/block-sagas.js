import {
  call,
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
    let isFirst = true

    const blockTracker = new PollingBlockTracker({provider: web3.currentProvider})

    blockTracker.on('latest', (block) => {
      // console.log('isFirst: ', isFirst)
      // if (block.transactions.length) {
        // console.log(block.transactions)
      // }
      if (isFirst) {
        isFirst = false
      } else {
        emit({type: 'BLOCK_LATEST', block})
      }
    })

    blockTracker.start().catch((error) => {
      console.error('Block Tracker Failed with error:')
      console.error(error)
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

function* addAddressIfExists(addressSet, address) {
  if (!address) { return false }
  address = address.toLowerCase()
  const contractKey = yield select(contractKeyByAddress, address)
  if (contractKey) {
    // console.log('contractKey for address: ', contractKey, address)
    addressSet.add(address)
    return true
  }
  return false
}

export function* collectTransactionAddresses(addressSet, transaction) {
  const web3 = yield getContext('web3')
  const to = yield call(addAddressIfExists, addressSet, transaction.to)
  const from = yield call(addAddressIfExists, addressSet, transaction.from)
  if (to || from) {
    const receipt = yield web3.eth.getTransactionReceipt(transaction.hash)
    // if (receipt) {
    //   console.log('receipt logs: ')
    //   console.log(receipt.logs)
    // }
    yield* receipt.logs.map(function* (log) {
      yield call(addAddressIfExists, addressSet, log.address)
    })
  }
}

export function* collectAllTransactionAddresses(transactions) {
  const addressSet = new Set()
  yield* transactions.map(function* (transaction) {
    yield call(collectTransactionAddresses, addressSet, transaction)
  })
  return addressSet
}

export function* latestBlock({block}) {
  const addressSet = yield call(collectAllTransactionAddresses, block.transactions)
  // if (addressSet.length) {
  //   console.log('addressSet', addressSet)
  // }
  yield* Array.from(addressSet).map(function* (address) {
    yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export default function* () {
  yield takeEvery('BLOCK_LATEST', latestBlock)
  yield fork(startBlockTracker)
}
