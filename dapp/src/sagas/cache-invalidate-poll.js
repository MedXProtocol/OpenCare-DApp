import { select, fork, put, call, getContext } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { contractByName } from '@/saga-genesis/state-finders'

function* cacheInvalidatePoll() {
  const contractRegistry = yield getContext('contractRegistry')
  while (true) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address: yield select(contractByName, 'CaseManager') })
    yield call(delay, 2000)
  }
}

export default function* () {
  yield fork(cacheInvalidatePoll)
}
