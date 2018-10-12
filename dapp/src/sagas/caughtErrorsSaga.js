import { takeEvery } from 'redux-saga/effects'
import { bugsnagClient } from '~/bugsnagClient'

export function* caughtErrorsSaga() {
  yield takeEvery('SAGA_GENESIS_CAUGHT_ERROR', function({ error }) {
    bugsnagClient.notify(error)
  })
}
