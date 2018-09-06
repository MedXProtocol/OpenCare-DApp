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
    console.log('transaction.hash', transaction.hash)
    const receipt = yield call(getReceiptData, transaction.hash)
    console.log('receipt', receipt)
    yield put({ type: 'BLOCK_TRANSACTION_RECEIPT', receipt })
  }
}

function* getReceiptData(txHash) {
  const web3 = yield getContext('web3')
  for (let i = 0; i < MAX_RETRIES; i++) {
    const receipt = yield web3.eth.getTransactionReceipt(txHash)
    console.log('attempt i, receipt', i, receipt)

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
  console.log('latestBlock({ block })', block)
  console.log('block.transactions', block.transactions)
  const addressSet = yield call(collectAllTransactionAddresses, block.transactions)
  yield call(invalidateAddressSet, addressSet)
}

function* updateCurrentBlockNumber() {
  const web3 = yield getContext('web3')
  const blockNumber = yield web3.eth.getBlockNumber()
  const currentBlockNumber = yield select(state => state.sagaGenesis.block.blockNumber)
  if (blockNumber !== currentBlockNumber) {
    console.log('blockNumber, currentBlockNumber', blockNumber, currentBlockNumber)
    yield put({
      type: 'UPDATE_BLOCK_NUMBER',
      blockNumber,
      lastBlockNumber: currentBlockNumber
    })
  }
}

function* gatherLatestBlocks({ blockNumber, lastBlockNumber }) {
  if (!lastBlockNumber) { return }
  console.log('gatherLatestBlocks({ blockNumber, lastBlockNumber })', blockNumber, lastBlockNumber)

  for (var i = lastBlockNumber + 1; i <= blockNumber; i++) {
    const block = yield call(getBlockData, i)
    yield put({ type: 'BLOCK_LATEST', block })
  }
}

function* getBlockData(blockId) {
  const web3 = yield getContext('web3')
  for (let i = 0; i < MAX_RETRIES; i++) {
    const block = yield web3.eth.getBlock(blockId, true)
    console.log('attempt i, yield web3.eth.getBlock(i, true), result', i, blockId, block)

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
    yield call(updateCurrentBlockNumber)
    yield call(delay, 1000)
  }
}

export default function* () {
  yield takeEvery('BLOCK_LATEST', latestBlock)
  yield takeEvery('BLOCK_TRANSACTION_RECEIPT', transactionReceipt)
  yield takeEvery('UPDATE_BLOCK_NUMBER', gatherLatestBlocks)

  yield startBlockPolling()
}
