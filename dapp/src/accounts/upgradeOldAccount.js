import { defined } from '~/utils/defined'
import { setAccountLocalStorage } from './setAccountLocalStorage'

function formatOldKey(address) {
  return `account-${address.toLowerCase()}`
}

function deleteOldAccount(address) {
  localStorage.removeItem(formatOldKey(address))
}

// Check for an old account and upgrade it to the new account shape and key
export const upgradeOldAccount = function(networkId, address) {
  const envNetworkId = parseInt(process.env.REACT_APP_REQUIRED_NETWORK_ID, 10)
  if (networkId !== envNetworkId) { return }

  let accountObject = JSON.parse(localStorage.getItem(formatOldKey(address)))

  if (defined(accountObject)) {
    accountObject.networkId = networkId
    setAccountLocalStorage(networkId, address, accountObject)
  }

  return accountObject
}
