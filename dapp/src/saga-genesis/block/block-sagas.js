import {
  call,
  put,
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
  const web3 = yield getContext('web3')
  const to = yield call(addAddressIfExists, addressSet, transaction.to)
  const from = yield call(addAddressIfExists, addressSet, transaction.from)
  if (to || from) {
    const receipt = yield web3.eth.getTransactionReceipt(transaction.hash)
    yield put({ type: 'BLOCK_TRANSACTION_RECEIPT', receipt })
  }
}

function* transactionReceipt({ receipt }) {
  const addressSet = new Set()
  yield receipt.logs.map(function* (log) {
    yield call(addAddressIfExists, addressSet, log.address)
    if (log.topics) {
      yield log.topics.map(function* (topic) {
        if (topic) {
          // topics are 32 bytes and will have leading 0's padded for typical Eth addresses, ignore them
          const actualAddress = '0x' + topic.substr(26)
          yield call(addAddressIfExists, addressSet, actualAddress)
        }
      })
    }
  })
  yield invalidateAddressSet(addressSet)
}

export function* invalidateAddressSet(addressSet) {
  yield Array.from(addressSet).map(function* (address) {
    yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export function* collectAllTransactionAddresses(transactions) {
  const addressSet = new Set()
  yield transactions.map(function* (transaction) {
    yield call(collectTransactionAddresses, addressSet, transaction)
  })
  return addressSet
}

export function* latestBlock({ block }) {
  const addressSet = yield call(collectAllTransactionAddresses, block.transactions)
  yield call(invalidateAddressSet, addressSet)
}

function* updateCurrentBlockNumber() {
  const web3 = yield getContext('web3')
  const blockNumber = yield web3.eth.getBlockNumber()
  const currentBlockNumber = yield select(state => state.sagaGenesis.block.blockNumber)
  if (blockNumber !== currentBlockNumber) {
    yield put({
      type: 'UPDATE_BLOCK_NUMBER',
      blockNumber,
      lastBlockNumber: currentBlockNumber
    })
  }
}

function* gatherLatestBlocks({ blockNumber, lastBlockNumber }) {
  if (!lastBlockNumber) { return }
  const web3 = yield getContext('web3')
  for (var i = lastBlockNumber + 1; i <= blockNumber; i++) {
    const block = yield web3.eth.getBlock(i, true)
    yield put({ type: 'BLOCK_LATEST', block })
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
