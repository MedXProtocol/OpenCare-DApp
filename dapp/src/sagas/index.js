import { all, fork } from 'redux-saga/effects'
import { drizzleSagas } from 'drizzle'
import getCaseInfo from './get-case-info'
import getDoctorCases from './get-doctor-cases'
import openCaseCount from './open-case-count'
import getCaseDate from './get-case-date'

export default function* rootSaga() {
  yield all(
    [
      getCaseInfo(),
      getDoctorCases(),
      openCaseCount(),
      getCaseDate()
    ].concat(drizzleSagas.map(saga => fork(saga)))
  )
}
