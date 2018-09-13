import { defined } from '~/utils/defined'
import { formatAccountKey } from './formatAccountKey'

export function setAccountLocalStorage(networkId, address, accountJson) {
  if (!defined(networkId) || !defined(address) || !defined(accountJson)) {
    console.warn('networkId, address and accountJson necessary to store account!')
    return
  }

  const key = formatAccountKey(networkId, address)
  accountJson.networkId = networkId
  localStorage.setItem(key, JSON.stringify(accountJson))

  return accountJson
}
