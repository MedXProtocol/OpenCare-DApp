import { KEY_STORE } from '~/accounts/constants'
import { setCookie } from '~/services/setCookie'

export function destroyAccount(address) {
  const keyStore = Cookie.getJSON(KEY_STORE) || {}
  delete keyStore[address]
  setCookie(KEY_STORE, keyStore)
}
