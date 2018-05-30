import { combineReducers } from 'redux'
import accounts from './account/account-reducer'
import cacheScope from './cache-scope/cache-scope-reducer'
import callCache from './call-cache/call-cache-reducer'
import transactions from './transaction/transaction-reducer'
import network from './network/network-reducer'

export const sagaGenesis = combineReducers({
  cacheScope,
  callCache,
  accounts,
  transactions,
  network
})
