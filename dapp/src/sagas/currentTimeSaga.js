import {
  call,
  put
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'

export function* currentTimeSaga() {
  while (true) {
    yield call(delay, 10000) // every 10 seconds update the time
    yield put({ type: 'UPDATE_TIME' })
  }
}
