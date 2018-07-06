import { combineReducers } from 'redux'
import account from './account-reducer'
import { sagaGenesis } from '~/saga-genesis/reducers'
import p2p from './p2p-reducer'
import { reducer as toastr } from 'react-redux-toastr'

export default combineReducers({
  sagaGenesis,
  account,
  toastr,
  p2p
})
