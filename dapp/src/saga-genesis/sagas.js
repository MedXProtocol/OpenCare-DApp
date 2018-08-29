import {
  all,
  fork,
  take,
  setContext
} from 'redux-saga/effects'

import accountSagas from './account/account-sagas'
import { addContract } from './contract/contract-sagas'
import blockSagas from './block/block-sagas'
import cacheScopeSagas from './cache-scope/cache-scope-sagas'
import cacheCallSagas from './call-cache/call-cache-sagas'
import networkSagas from './network/network-sagas'
import ethBalanceSagas from './ethBalance/ethBalanceSagas'
import transactionSagas, { web3Send } from './transaction/transaction-sagas'
import web3Initialize from './web3/web3-sagas'
import { logSaga } from './logs/logSaga'

export * from './call-cache/call-cache-sagas'

function* takeOnceAndRun(pattern, saga) {
  const action = yield take(pattern)
  yield saga(action)
}

export function* start({ web3 }) {
  yield setContext({ web3 })
  yield all(
    [
      cacheCallSagas(),
      networkSagas(),
      accountSagas(),
      blockSagas(),
      cacheScopeSagas(),
      transactionSagas(),
      ethBalanceSagas(),
      logSaga()
    ]
  )
}

export {
  web3Send,
  addContract,
  takeOnceAndRun
}

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_INITIALIZED', start)
  yield web3Initialize()
}
