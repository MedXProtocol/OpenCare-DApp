import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { getCaseDate } from '@/utils/web3-util'

function* fetchCaseDate(action) {
   try {
      const date = yield call(getCaseDate, action.address)
      yield put({type: "CASE_DATE_FETCH_SUCCEEDED", address: action.address, date: date})
   } catch (e) {
      yield put({type: "CASE_DATE_FETCH_FAILED", message: e.message})
   }
}

function* saga() {
  yield takeLatest("CASE_DATE_FETCH_REQUESTED", fetchCaseDate);
}

export default saga
