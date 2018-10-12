import {
  all,
  fork,
  setContext,
  put
} from 'redux-saga/effects'
import { sagas as rootSagaGenesis, takeOnceAndRun } from 'saga-genesis'
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
import { mixpanelSagas } from './mixpanelSagas'
import { customProviderWeb3 } from '~/utils/customProviderWeb3'
import { caughtErrorsSaga } from './caughtErrorsSaga'

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_NETWORK_ID', function* ({ web3, networkId }) {
    yield setContext({ web3 })
    yield put({ type: 'SET_READ_WEB3', readWeb3: customProviderWeb3(networkId) })
    yield addTopLevelContracts()
    yield caughtErrorsSaga()
    yield addRegistryContracts({ web3 })
    yield fork(all, [
      signInSaga(),
      signOutSaga(),
      signUpSaga(),
      nextAvailableDoctorSaga(),
      pollExternalTransactionsSaga(),
      failedTransactionListener(),
      mixpanelSagas({ networkId }),
      whisperSaga(),
      heartbeatSaga()
    ])
  })
  yield rootSagaGenesis()
}
