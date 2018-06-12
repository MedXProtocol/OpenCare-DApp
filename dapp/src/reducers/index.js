import { combineReducers } from 'redux'
import account from './account-reducer'
import { sagaGenesis } from '~/saga-genesis/reducers'

export default combineReducers({
  sagaGenesis,
  account
})
