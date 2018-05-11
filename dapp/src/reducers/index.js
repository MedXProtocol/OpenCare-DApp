import { combineReducers } from 'redux'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'
import caseCount from './case-count-reducer'

export default combineReducers({
  doctorCases,
  cases,
  caseCount
})
