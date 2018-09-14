import {
  call,
  put,
  all,
  takeEvery,
  getContext,
  select,
  fork
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'
import {
  contractKeyByAddress
} from '../state-finders'
import { bugsnagClient } from '~/bugsnagClient'

const MAX_RETRIES = 50

function* addAddressIfExists(addressSet, address) {
  if (!address) { return false }
  address = address.toLowerCase()
  const contractKey = yield select(contractKeyByAddress, address)
  if (contractKey) {
    addressSet.add(address)
    return true
  }
  return false
}

function* collectTransactionAddresses(addressSet, transaction) {
  const to = yield call(addAddressIfExists, addressSet, transaction.to)
  const from = yield call(addAddressIfExists, addressSet, transaction.from)
  if (to || from) {
    const receipt = yield call(getReceiptData, transaction.hash)
    console.log('got new receipt: ', receipt)

    yield put({ type: 'BLOCK_TRANSACTION_RECEIPT', receipt })
  }
}

function* getReceiptData(txHash) {
  const web3 = yield getContext('web3')
  for (let i = 0; i < MAX_RETRIES; i++) {
    const receipt = yield call(web3.eth.getTransactionReceipt, txHash)

    if (receipt) {
      return receipt
    } else if (i > MAX_RETRIES) {
      // attempts failed after 50 x 2secs
      throw new Error('Unable to get receipt from network');
    } else {
      yield call(delay, 2000)
    }
  }
}

function* transactionReceipt({ receipt }) {
  const addressSet = new Set()
  yield all(receipt.logs.map(function* (log) {
    yield call(addAddressIfExists, addressSet, log.address)
    if (log.topics) {
      yield all(log.topics.map(function* (topic) {
        if (topic) {
          console.log('got new topic: ', topic)

          // topics are 32 bytes and will have leading 0's padded for typical Eth addresses, ignore them
          const actualAddress = '0x' + topic.substr(26)
          yield call(addAddressIfExists, addressSet, actualAddress)
        }
      }))
    }
  }))
  yield invalidateAddressSet(addressSet)
}

export function* invalidateAddressSet(addressSet) {
  yield all(Array.from(addressSet).map(function* (address) {
    yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
  }))
}

export function* collectAllTransactionAddresses(transactions) {
  const addressSet = new Set()
  yield all(transactions.map(function* (transaction) {
    yield call(collectTransactionAddresses, addressSet, transaction)
  }))
  return addressSet
}

export function* latestBlock({ block }) {
  try {
    const addressSet = yield call(collectAllTransactionAddresses, block.transactions)
    yield call(invalidateAddressSet, addressSet)
  } catch (e) {
    bugsnagClient.notify(e)
  }
}

function* updateCurrentBlockNumber() {
  const web3 = yield getContext('web3')
  const blockNumber = yield call(web3.eth.getBlockNumber)
  const currentBlockNumber = yield select(state => state.sagaGenesis.block.blockNumber)
  if (blockNumber !== currentBlockNumber) {
    console.log('blockNumber: ', blockNumber)
    console.log('currentBlockNumber: ', currentBlockNumber)
    yield put({
      type: 'UPDATE_BLOCK_NUMBER',
      blockNumber,
      lastBlockNumber: currentBlockNumber
    })
  }
}

function* gatherLatestBlocks({ blockNumber, lastBlockNumber }) {
  if (!lastBlockNumber) { return }

  try {
    for (var i = lastBlockNumber + 1; i <= blockNumber; i++) {
      const block = yield call(getBlockData, i)
      console.log('got new block: ', block)
      yield put({ type: 'BLOCK_LATEST', block })
    }
  } catch (e) {
    bugsnagClient.notify(e)
  }
}

function* getBlockData(blockId) {
  const web3 = yield getContext('web3')
  for (let i = 0; i < MAX_RETRIES; i++) {
    const block = yield call(web3.eth.getBlock, blockId, true)

    if (block) {
      return block
    } else if (i > MAX_RETRIES) {
      // attempts failed after 50 x 2secs
      throw new Error('Unable to get block from network');
    } else {
      yield call(delay, 2000)
    }
  }
}

function* startBlockPolling() {
  while (true) {
    try {
      yield call(updateCurrentBlockNumber)
    } catch (e) {
      bugsnagClient.notify(e)
    }
    yield call(delay, 1000)
  }
}

export default function* () {
  yield takeEvery('BLOCK_LATEST', latestBlock)
  yield takeEvery('BLOCK_TRANSACTION_RECEIPT', transactionReceipt)
  yield takeEvery('UPDATE_BLOCK_NUMBER', gatherLatestBlocks)

  yield startBlockPolling()
}
