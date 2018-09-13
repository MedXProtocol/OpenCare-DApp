import { defined } from '~/utils/defined'
import { formatAccountKey } from './formatAccountKey'

export function setAccountLocalStorage(networkId, address, accountObject) {
  if (!defined(networkId) || !defined(address) || !defined(accountObject)) {
    throw new Error('networkId, address and accountObject necessary to store account!')
  } else {
    const key = formatAccountKey(networkId, address)
    accountObject.networkId = networkId
    localStorage.setItem(key, JSON.stringify(accountObject))

    return accountObject
  }
}
