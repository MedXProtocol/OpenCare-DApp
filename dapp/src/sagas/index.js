import { all, fork } from 'redux-saga/effects'
import getCaseInfo from './get-case-info'
import getDoctorCases from './get-doctor-cases'
import openCaseCount from './open-case-count'
import getCaseDate from './get-case-date'
import { rootSagaGenesis  } from '@/saga-genesis'

export default function* () {
  yield all(
    [
      getCaseInfo(),
      getDoctorCases(),
      openCaseCount(),
      getCaseDate(),
      rootSagaGenesis()
    ]
  )
}
