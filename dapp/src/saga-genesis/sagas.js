import { all } from 'redux-saga/effects'

import accountSagas from './account/account-sagas'
import blockSagas from './block/block-sagas'
import cacheScopeSagas from './cache-scope/cache-scope-sagas'
import callCacheSagas, { cacheCall } from './call-cache/call-cache-sagas'
import networkSagas from './network/network-sagas'
import transactionSagas from './transaction/transaction-sagas'

export {
  cacheCall
}

export default function* () {
  yield all(
    [
      accountSagas(),
      blockSagas(),
      cacheScopeSagas(),
      callCacheSagas(),
      networkSagas(),
      transactionSagas()
    ]
  )
}
