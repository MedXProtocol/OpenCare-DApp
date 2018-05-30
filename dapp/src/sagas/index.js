import { all, fork, takeEvery } from 'redux-saga/effects'
import rootSagaGenesis, { takeWeb3Initialized } from '@/saga-genesis/sagas'
import web3CallReturn from './web3-call-return'
import cacheInvalidatePoll from './cache-invalidate-poll'
import addTopLevelContracts from './add-top-level-contracts'
import addRegistryContracts from './add-registry-contracts'

function* start() {
  yield addTopLevelContracts()
  yield all(
    [
      web3CallReturn(),
      cacheInvalidatePoll()
    ]
  )
}

export default function* () {
  yield fork(takeWeb3Initialized, start)
  yield takeEvery('WEB3_NETWORK_ID', addRegistryContracts)
  yield rootSagaGenesis()
}
