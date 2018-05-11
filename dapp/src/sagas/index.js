import { all } from 'redux-saga/effects'
import getCaseInfo from './get-case-info'

export default function* rootSaga() {
  yield all([
    getCaseInfo()
  ])
}
