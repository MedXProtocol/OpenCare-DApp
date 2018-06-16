import Cookie from 'js-cookie'
import { KEY_STORE } from '~/accounts/constants'

export function destroyAccount(address) {
  const keyStore = Cookie.getJSON(KEY_STORE) || {}
  delete keyStore[address]
  Cookie.set(KEY_STORE, keyStore)
}
