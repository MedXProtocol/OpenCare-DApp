import { all, fork } from 'redux-saga/effects'
import { drizzleSagas } from 'drizzle'
import getCaseInfo from './get-case-info'
import getDoctorCases from './get-doctor-cases'
import openCaseCount from './open-case-count'
import getCaseDate from './get-case-date'
import sagaGenesis from '@/saga-genesis/sagas'

import contractRegistry from '@/contract-registry'

export default function* rootSaga() {
  yield all(
    [
      getCaseInfo(),
      getDoctorCases(),
      openCaseCount(),
      getCaseDate(),
      sagaGenesis({contractRegistry})
    ].concat(drizzleSagas.map(saga => fork(saga)))
  )
}
