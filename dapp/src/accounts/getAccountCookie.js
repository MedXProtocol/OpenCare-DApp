import Cookie from 'js-cookie'
import { KEY_STORE } from '~/accounts/constants'

export function getAccountCookie(address) {
  const keyStore = Cookie.getJSON(KEY_STORE) || {}

  // We had a problem where we were setting the address key to 'undefined'
  // This clears those incorrect cookies:
  delete keyStore[undefined]

  return keyStore[address]
}
