import { combineReducers } from 'redux'
import account from './account-reducer'
import { sagaGenesis } from '~/saga-genesis/reducers'
import heartbeat from './heartbeat-reducer'
import { betaFaucet } from './betaFaucetReducer'
import { reducer as toastr } from 'react-redux-toastr'
import nextAvailableDoctor from './next-available-doctor-reducer'
import externalTransactions from './externalTransactionsReducer'
import caseLogs from './case-logs-reducer'

export default combineReducers({
  sagaGenesis,
  account,
  toastr,
  heartbeat,
  betaFaucet,
  nextAvailableDoctor,
  externalTransactions,
  caseLogs
})
