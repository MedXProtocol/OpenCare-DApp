import { reducers as sagaGenesis } from 'saga-genesis'
import { combineReducers } from 'redux'
import account from './account-reducer'
import heartbeat from './heartbeat-reducer'
import { betaFaucet } from './betaFaucetReducer'
import { reducer as toastr } from 'react-redux-toastr'
import nextAvailableDoctor from './next-available-doctor-reducer'
import externalTransactions from './externalTransactionsReducer'
import caseLogs from './caseLogsReducer'
import caseManagerLogs from './caseManagerLogsReducer'
import keyValue from './keyValueReducer'

export default combineReducers({
  sagaGenesis,
  account,
  toastr,
  heartbeat,
  betaFaucet,
  nextAvailableDoctor,
  externalTransactions,
  caseLogs,
  caseManagerLogs,
  keyValue
})
