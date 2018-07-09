import Cookie from 'js-cookie'
import { setCookie } from '~/services/setCookie'
import { KEY_STORE } from '~/accounts/constants'

export function setAccount(address, account) {
  let keyStore = Cookie.getJSON(KEY_STORE)
  if (typeof keyStore !== 'object') {
    keyStore = {}
  }
  keyStore[address] = account
  setCookie(KEY_STORE, keyStore)
}
