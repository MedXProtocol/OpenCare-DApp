import { combineReducers } from 'redux'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'
import caseCount from './case-count-reducer'
import caseDates from './case-date-reducer'
import account from './account-reducer'
import { sagaGenesis } from '@/saga-genesis/reducers'

export default combineReducers({
  doctorCases,
  cases,
  caseDates,
  caseCount,
  sagaGenesis,
  account
})
