import Cookie from 'js-cookie'
import { KEY_STORE } from './constants'

export function setAccount(address, account) {
  let keyStore = Cookie.getJSON(KEY_STORE)
  if (typeof keyStore !== 'object') {
    keyStore = {}
  }
  keyStore[address] = account
  Cookie.set(KEY_STORE, keyStore)
}
