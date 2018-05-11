import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { getCaseStatus } from '@/utils/web3-util'

function* fetchCaseStatus(action) {
   try {
      const status = yield call(getCaseStatus, action.address)
      yield put({type: "CASE_FETCH_SUCCEEDED", address: action.address, status: status})
   } catch (e) {
      yield put({type: "CASE_FETCH_FAILED", message: e.message})
   }
}

function* getCaseInfo() {
  yield takeLatest("CASE_FETCH_REQUESTED", fetchCaseStatus);
}

export default getCaseInfo
