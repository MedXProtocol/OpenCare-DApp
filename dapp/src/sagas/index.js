import { all, fork, takeEvery } from 'redux-saga/effects'
import rootSagaGenesis, { takeOnceAndRun } from '@/saga-genesis/sagas'
import addTopLevelContracts from './add-top-level-contracts'
import addRegistryContracts from './add-registry-contracts'

export default function* () {
  yield fork(takeOnceAndRun, 'WEB3_INITIALIZED', addTopLevelContracts)
  yield takeEvery('WEB3_NETWORK_ID', addRegistryContracts)
  yield rootSagaGenesis()
}
