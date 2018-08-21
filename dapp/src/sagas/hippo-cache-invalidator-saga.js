import {
  call,
  put,
  takeEvery,
  getContext,
  select,
  fork
} from 'redux-saga/effects'
import {
  contractKeyByAddress
} from '~/saga-genesis'

function* addAddressIfExists(addressSet, address) {
  if (!address) { return false }
  address = address.toLowerCase()
  const contractKey = yield select(contractKeyByAddress, address)
  if (contractKey) {
    console.log('contractKey for address: ', contractKey, address)
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
  yield* Array.from(addressSet).map(function* (address) {
    yield fork(put, {type: 'CACHE_INVALIDATE_ADDRESS', address})
  })
}

export function* hippoCacheInvalidatorSaga() {
  yield takeEvery('BLOCK_LATEST', latestBlock)
}
