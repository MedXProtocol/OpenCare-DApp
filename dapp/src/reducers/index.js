import { combineReducers } from 'redux'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'
import caseCount from './case-count-reducer'
import caseDates from './case-date-reducer'

export default combineReducers({
  doctorCases,
  cases,
  caseDates,
  caseCount
})
