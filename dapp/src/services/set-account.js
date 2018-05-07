import Cookie from 'js-cookie'
import { KEY_STORE } from './constants'

export function setAccount(account) {
  Cookie.set(KEY_STORE, account)
}
