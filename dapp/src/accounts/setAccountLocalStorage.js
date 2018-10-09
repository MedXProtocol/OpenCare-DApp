import { defined } from '~/utils/defined'
import { formatAccountKey } from './formatAccountKey'

export function setAccountLocalStorage(networkId, address, accountObject) {
  if (!defined(networkId) || !defined(address) || !defined(accountObject)) {
    throw new Error('networkId, address and accountObject necessary to store account!')
  } else {
    const key = formatAccountKey(networkId, address)
    // possibly need to force the address to equal the passed in address
    // instead of a potentially stale accountObject.address()
    // accountObject.address = address
    accountObject.networkId = networkId
    localStorage.setItem(key, JSON.stringify(accountObject))

    return accountObject
  }
}
