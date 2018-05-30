import { combineReducers } from 'redux'
import accounts from './account/account-reducer'
import cacheScope from './cache-scope/cache-scope-reducer'
import contracts from './contract/contract-reducer'
import callCache from './call-cache/call-cache-reducer'
import transactions from './transaction/transaction-reducer'
import network from './network/network-reducer'
import web3 from './web3/web3-reducer'

export const sagaGenesis = combineReducers({
  cacheScope,
  callCache,
  accounts,
  transactions,
  network,
  contracts,
  web3
})
