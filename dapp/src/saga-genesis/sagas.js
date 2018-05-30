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
import { cacheCall } from './call-cache/call-cache-sagas'
import networkSagas from './network/network-sagas'
import transactionSagas from './transaction/transaction-sagas'
import web3Initialize, { takeWeb3Initialized } from './web3/web3-sagas'
import callSagas, { web3Call } from './call/call-sagas'

export {
  web3Call,
  cacheCall,
  addContract,
  takeWeb3Initialized
}

function* start({ web3 }) {
  yield setContext({ web3 })
  yield all(
    [
      callSagas(),
      networkSagas(),
      accountSagas(),
      blockSagas(),
      cacheScopeSagas(),
      transactionSagas()
    ]
  )
}

export default function* () {
  yield fork(takeWeb3Initialized, start)
  yield web3Initialize()
}
