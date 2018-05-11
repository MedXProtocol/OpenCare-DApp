import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import {
  getDoctorAuthorizationRequestCount,
  getDoctorAuthorizationRequestCaseAtIndex
} from '@/utils/web3-util'

export function* fetchCaseStatus(action) {
   try {
      const count = yield call(getDoctorAuthorizationRequestCount)
      yield put({type: "DOCTOR_CASES_FETCH_STARTED", count: count})
      for (let i = 0; i < count; i++) {
        let address = yield call(getDoctorAuthorizationRequestCaseAtIndex, i)
        yield put({type: 'DOCTOR_CASES_FETCH_SINGLE_SUCCEEDED', address: address, index: i})
      }
      yield put({type: "DOCTOR_CASES_FETCH_SUCCEEDED"})
   } catch (e) {
      yield put({type: "DOCTOR_CASES_FETCH_FAILED", message: e.message})
   }
}

function* getDoctorCases() {
  yield takeLatest("DOCTOR_CASES_FETCH_REQUESTED", fetchCaseStatus);
}

export default getDoctorCases
