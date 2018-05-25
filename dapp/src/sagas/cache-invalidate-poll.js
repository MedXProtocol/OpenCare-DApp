import { fork, put, call, getContext } from 'redux-saga/effects'
import { delay } from 'redux-saga'

function* cacheInvalidatePoll() {
  const contractRegistry = yield getContext('contractRegistry')
  while (true) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address: contractRegistry.addressByName('CaseManager')})
    yield call(delay, 2000)
  }
}

export default function* () {
  yield fork(cacheInvalidatePoll)
}
