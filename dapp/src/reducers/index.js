import { combineReducers } from 'redux'
import account from './account-reducer'
import { sagaGenesis } from '~/saga-genesis/reducers'
import heartbeat from './heartbeat-reducer'
import { betaFaucet } from './betaFaucetReducer'
import { currentTime } from './currentTimeReducer'
import { reducer as toastr } from 'react-redux-toastr'
import nextAvailableDoctor from './next-available-doctor-reducer'
import externalTransactions from './externalTransactionsReducer'
import caseLogs from './caseLogsReducer'
import caseManagerLogs from './caseManagerLogsReducer'

export default combineReducers({
  sagaGenesis,
  account,
  toastr,
  heartbeat,
  currentTime,
  betaFaucet,
  nextAvailableDoctor,
  externalTransactions,
  caseLogs,
  caseManagerLogs
})
