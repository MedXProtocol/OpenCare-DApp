import {
  call,
  put,
  takeEvery,
  getContext,
  select,
  fork
} from 'redux-saga/effects'
import {
  contractKeyByAddress,
  contractByName
} from '~/saga-genesis'

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

    if (receipt) {
      yield* receipt.logs.map(function* (log) {
        const topics = yield log.topics
        if (topics) {
          yield* topics.map(function* (topic) {
            // topics are 32 bytes and will have leading 0's padded for typical Eth addresses, ignore them
            const actualAddress = '0x' + topic.substr(26)
            yield call(addAddressIfExists, addressSet, actualAddress)
          })
        }
      })
    }
  }
}

export function* collectAllTransactionAddresses(transactions) {
  const addressSet = new Set()
  yield* transactions.map(function* (transaction) {
    yield call(collectTransactionAddresses, addressSet, transaction)
  })
  return addressSet
}

export function* latestBlock({ block }) {
  const addressSet = yield call(collectAllTransactionAddresses, block.transactions)
  const addressSetAsArray = yield Array.from(addressSet)
  yield* addressSetAsArray.map(function* (address) {
    // console.log('invalidating: ' + address)
    yield fork(put, { type: 'CACHE_INVALIDATE_ADDRESS', address })
  })

  // Include any other contracts who's cache values we should invalidate if we have a
  // contract in the block's transaction's log's topics which we care about
  if (addressSetAsArray.length > 0) {
    const caseScheduleManagerAddress = yield select(contractByName, 'CaseScheduleManager')
    // console.log('invalidating: ' + caseScheduleManagerAddress)
    yield fork(put, { type: 'CACHE_INVALIDATE_ADDRESS', caseScheduleManagerAddress })

    const caseManagerAddress = yield select(contractByName, 'CaseManager')
    // console.log('invalidating: ' + caseManagerAddress)
    yield fork(put, { type: 'CACHE_INVALIDATE_ADDRESS', caseManagerAddress })
  }
}

export function* hippoCacheInvalidatorSaga() {
  yield takeEvery('BLOCK_LATEST', latestBlock)
}
