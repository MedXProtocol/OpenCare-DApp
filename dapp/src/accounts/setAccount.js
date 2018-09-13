import { storageAvailable } from '~/services/storageAvailable'
import { setAccountLocalStorage } from './setAccountLocalStorage'

export function setAccount(networkId, address, account) {
  if (storageAvailable('localStorage')) {
    setAccountLocalStorage(networkId, address, account)
  } else {
    console.error('Unable to set account! Possibly no access to localStorage')
  }
}
