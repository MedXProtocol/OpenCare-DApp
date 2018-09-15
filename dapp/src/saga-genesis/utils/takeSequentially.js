import {
  take,
  call,
  actionChannel
} from 'redux-saga/effects'

export function* takeSequentially(pattern, saga) {
  const channel = yield actionChannel(pattern)
  while (true) {
    const action = yield take(channel)
    yield call(saga, action)
  }
}
