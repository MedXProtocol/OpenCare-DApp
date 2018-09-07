import {
  take
} from 'redux-saga/effects'

export function* takeOnceAndRun(pattern, saga) {
  const action = yield take(pattern)
  yield saga(action)
}
