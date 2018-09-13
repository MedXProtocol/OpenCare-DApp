import { storageAvailable } from '~/services/storageAvailable'
import { getAccountLocalStorage } from './getAccountLocalStorage'

export function getAccount(networkId, address) {
  if (!networkId || !address) { return null }

  let accountObject
  if (storageAvailable('localStorage')) {
    accountObject = getAccountLocalStorage(networkId, address)
    console.log(accountObject)
  }

  return accountObject
}
