import { combineReducers } from 'redux'
import account from './account-reducer'
import { sagaGenesis } from '~/saga-genesis/reducers'
import heartbeat from './heartbeat-reducer'
import { betaFaucet } from './betaFaucetReducer'
import { reducer as toastr } from 'react-redux-toastr'

export default combineReducers({
  sagaGenesis,
  account,
  toastr,
  heartbeat,
  betaFaucet
})
