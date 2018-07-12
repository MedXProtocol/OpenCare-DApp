import { storageAvailable } from '~/services/storageAvailable'
import { setAccountCookie } from './setAccountCookie'
import { setAccountLocalStorage } from './setAccountLocalStorage'

export function setAccount(address, account) {
  if (storageAvailable('localStorage')) {
    setAccountLocalStorage(address, account)
    setAccountCookie(address, null) // clear out the cookie
  } else {
    setAccountCookie(address, account)
  }
}
