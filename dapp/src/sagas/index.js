import {
  all,
  fork,
  setContext
} from 'redux-saga/effects'
import rootSagaGenesis, { takeOnceAndRun } from '~/saga-genesis/sagas'
import addTopLevelContracts from './add-top-level-contracts-saga'
import addRegistryContracts from './add-registry-contracts-saga'
import signInSaga from './sign-in-saga'
import signOutSaga from './sign-out-saga'
import signUpSaga from './sign-up-saga'
import heartbeatSaga from './heartbeat-saga'
import { nextAvailableDoctorSaga } from './next-available-doctor-saga'
import { pollExternalTransactionsSaga } from './pollExternalTransactionsSaga'
import { failedTransactionListener } from './failedTransactionListener'
import { whisperSaga } from './whisperSaga'

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_NETWORK_ID', function* ({ web3, networkId }) {
    yield setContext({ web3 })
    yield addTopLevelContracts()
    yield addRegistryContracts({ web3 })
    yield fork(all, [
      signInSaga(),
      signOutSaga(),
      signUpSaga(),
      nextAvailableDoctorSaga(),
      pollExternalTransactionsSaga(),
      failedTransactionListener(),
      whisperSaga(),
      heartbeatSaga()
    ])
  })
  yield rootSagaGenesis()
}
