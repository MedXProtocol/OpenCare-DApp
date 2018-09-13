import { storageAvailable } from '~/services/storageAvailable'
import { getAccountLocalStorage } from './getAccountLocalStorage'

export function getAccount(networkId, address) {
  if (!address || !networkId) { return null }
  let account
  if (storageAvailable('localStorage')) {
    account = getAccountLocalStorage(networkId, address) || account
  }
  return account
}
