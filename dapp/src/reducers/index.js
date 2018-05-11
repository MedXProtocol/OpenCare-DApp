import { combineReducers } from 'redux'
import doctorCases from './doctor-cases-reducer'
import cases from './cases-reducer'

export default combineReducers({
  doctorCases,
  cases
})
