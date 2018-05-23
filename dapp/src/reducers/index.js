import { combineReducers } from 'redux'
import { drizzleReducers } from 'drizzle'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'
import caseCount from './case-count-reducer'
import caseDates from './case-date-reducer'
import cache from '@/saga-genesis/cache-reducer'
import calls from '@/saga-genesis/calls-reducer'

export default combineReducers({
  doctorCases,
  cases,
  caseDates,
  caseCount,
  cache,
  calls,
  ...drizzleReducers
})
