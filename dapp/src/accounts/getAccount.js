import { storageAvailable } from '~/services/storageAvailable'
import { getAccountLocalStorage } from './getAccountLocalStorage'
import { getAccountCookie } from './getAccountCookie'

export function getAccount(address) {
  if (!address) { return null }
  let account = getAccountCookie(address)
  if (storageAvailable('localStorage')) {
    account = getAccountLocalStorage(address) || account
  }
  return account
}
