import Cookie from 'js-cookie'
import { KEY_STORE } from './constants'

export function getAccount() {
  return Cookie.getJSON(KEY_STORE)
}
