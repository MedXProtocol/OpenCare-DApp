import { isBlank } from '~/utils/isBlank'
import { setAccountLocalStorage } from '~/accounts/setAccountLocalStorage'

function formatOldKey(address) {
  return `account-${address.toLowerCase()}`
}

function deleteOldAccount(address) {
  localStorage.removeItem(formatOldKey(address))
}

// check for old account and upgrade it if we have one to the new account key
export const upgradeOldAccount = function(networkId, address) {
  const envNetworkId = parseInt(process.env.REACT_APP_REQUIRED_NETWORK_ID, 10)

  if (!networkId || !address || (networkId !== envNetworkId)) { return }

  let result
  let json = localStorage.getItem(formatOldKey(address))

  if (json) {
    if (isBlank(json)) {
      deleteOldAccount(address)
    } else {
      setAccountLocalStorage(networkId, address, JSON.parse(json))
      result = true

      deleteOldAccount(address)
    }
  }

  return result
}
