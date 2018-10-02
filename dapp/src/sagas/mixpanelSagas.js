import { mixpanel } from '~/mixpanel'

export function* mixpanelSagas({ networkId }) {
  yield mixpanel.register({ 'Network ID': networkId })
}
