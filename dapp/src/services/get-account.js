import Cookie from 'js-cookie'
import { KEY_STORE } from './constants'

export function getAccount(address) {
  const keyStore = Cookie.getJSON(KEY_STORE) || {}
  return keyStore[address]
}
