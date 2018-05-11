import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { openCaseCount } from '@/utils/web3-util'

function* fetchOpenCaseCount(action) {
   try {
      const count = yield call(openCaseCount)
      yield put({type: "OPEN_CASE_COUNT_FETCH_SUCCEEDED", count: count})
   } catch (e) {
      yield put({type: "OPEN_CASE_COUNT_FETCH_FAILED", message: e.message})
   }
}

function* getOpenCaseCount() {
  yield takeLatest("OPEN_CASE_COUNT_FETCH_REQUESTED", fetchOpenCaseCount);
}

export default getOpenCaseCount
