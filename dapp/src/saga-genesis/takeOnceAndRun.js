import {
  take
} from 'redux-saga'

export function* takeOnceAndRun(pattern, saga) {
  const action = yield take(pattern)
  yield saga(action)
}
