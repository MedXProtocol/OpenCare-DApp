import {
  all,
  fork
} from 'redux-saga/effects'
import rootSagaGenesis, { takeOnceAndRun } from '~/saga-genesis/sagas'
import addTopLevelContracts from './add-top-level-contracts-saga'
import addRegistryContracts from './add-registry-contracts-saga'
import signInSaga from './sign-in-saga'
import signOutSaga from './sign-out-saga'
import signUpSaga from './sign-up-saga'
import heartbeatSaga from './heartbeat-saga'
import { nextAvailableDoctorSaga } from './next-available-doctor-saga'

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_NETWORK_ID', function* ({ web3, networkId }) {
    yield addTopLevelContracts()
    yield addRegistryContracts({ web3 })
    yield all([
      signInSaga(),
      signOutSaga(),
      signUpSaga(),
      heartbeatSaga(),
      nextAvailableDoctorSaga()
    ])
  })
  yield rootSagaGenesis()
}
