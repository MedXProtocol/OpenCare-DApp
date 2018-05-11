import { all } from 'redux-saga/effects'
import getCaseInfo from './get-case-info'
import getDoctorCases from './get-doctor-cases'
import openCaseCount from './open-case-count'
import getCaseDate from './get-case-date'

export default function* rootSaga() {
  yield all([
    getCaseInfo(),
    getDoctorCases(),
    openCaseCount(),
    getCaseDate()
  ])
}
