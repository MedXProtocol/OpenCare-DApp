import { storageAvailable } from '~/services/storageAvailable'
import { getAccountLocalStorage } from './getAccountLocalStorage'
import { getAccountCookie } from './getAccountCookie'

export function getAccount(address) {
  if (!address) { return null }
  let account = null;
  if (storageAvailable('localStorage')) {
    account = getAccountLocalStorage(address)
  } else {
    account = getAccountCookie(address)
  }
  return account
}
