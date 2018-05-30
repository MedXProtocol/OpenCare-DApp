import { combineReducers } from 'redux'
import cache from './cache/cache-reducer'
import calls from './calls/calls-reducer'
import sagas from './saga-reducer'
import accounts from './accounts/accounts-reducer'
import sends from './sends/sends-reducer'

export const sagaGenesis = combineReducers({
  cache,
  calls,
  sagas,
  accounts,
  sends
})
