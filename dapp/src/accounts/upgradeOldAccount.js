import { defined } from '~/utils/defined'
import { setAccountLocalStorage } from './setAccountLocalStorage'
import { requiredNetworkIds } from '~/services/requiredNetworkIds'

function formatOldKey(address) {
  return `account-${address.toLowerCase()}`
}

// Check for an old account and upgrade it to the new account shape and key
export const upgradeOldAccount = function(networkId, address) {
  const envNetworkIds = requiredNetworkIds()
  if (!envNetworkIds.includes(networkId)) { return }

  let accountObject = JSON.parse(localStorage.getItem(formatOldKey(address)))

  if (defined(accountObject)) {
    accountObject.networkId = networkId
    setAccountLocalStorage(networkId, address, accountObject)
  }

  return accountObject
}
