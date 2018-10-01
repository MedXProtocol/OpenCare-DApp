import { takeEvery } from 'redux-saga/effects'
import { mixpanel } from '~/mixpanel'

export function* mixpanelSagas({ networkId }) {
  yield mixpanel.register({ 'Network ID': networkId })
}
