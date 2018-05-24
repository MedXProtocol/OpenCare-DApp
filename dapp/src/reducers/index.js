import { combineReducers } from 'redux'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'
import caseCount from './case-count-reducer'
import caseDates from './case-date-reducer'
import cache from '@/saga-genesis/cache-reducer'
import calls from '@/saga-genesis/calls-reducer'
import sagas from '@/saga-genesis/saga-reducer'
import accounts from '@/saga-genesis/accounts-reducer'
import sends from '@/saga-genesis/sends-reducer'

export default combineReducers({
  doctorCases,
  cases,
  caseDates,
  caseCount,
  cache,
  calls,
  sagas,
  accounts,
  sends
})
