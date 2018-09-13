import { storageAvailable } from '~/services/storageAvailable'
import { setAccountLocalStorage } from './setAccountLocalStorage'

export function setAccount(networkId, address, accountObject) {
  if (storageAvailable('localStorage')) {
    setAccountLocalStorage(networkId, address, accountObject)
  }
}
