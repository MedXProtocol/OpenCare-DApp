import { all, fork, takeEvery } from 'redux-saga/effects'
import rootSagaGenesis, { takeOnceAndRun } from '~/saga-genesis/sagas'
import addTopLevelContracts from './add-top-level-contracts-saga'
import addRegistryContracts from './add-registry-contracts-saga'
import signInSaga from './sign-in-saga'
import signOutSaga from './sign-out-saga'
import signUpSaga from './sign-up-saga'
import heartbeatSaga from './heartbeat-saga'

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_INITIALIZED', addTopLevelContracts)
  yield takeEvery('WEB3_NETWORK_ID', addRegistryContracts)

  yield all([
    rootSagaGenesis(),
    signInSaga(),
    signOutSaga(),
    signUpSaga(),
    heartbeatSaga()
  ])
}
