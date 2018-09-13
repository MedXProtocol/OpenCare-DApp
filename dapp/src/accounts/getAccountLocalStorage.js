import { defined } from '~/utils/defined'
import { formatAccountKey } from './formatAccountKey'
import { upgradeOldAccount } from './upgradeOldAccount'

export function getAccountLocalStorage(networkId, address) {
  let accountObject

  accountObject = JSON.parse(localStorage.getItem(formatAccountKey(networkId, address)))

  if (!defined(accountObject)) {
    accountObject = upgradeOldAccount(networkId, address)
  }

  return accountObject
}
