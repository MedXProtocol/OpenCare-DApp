import { setAccountLocalStorage } from '~/accounts/setAccountLocalStorage'

//////////
// TODO: WARNING this might run upgradeOldAccount on a domain with the wrong domain networkId!~

///////////// !!!

// check for old account and upgrade it if we have one to the new account key
export const upgradeOldAccount = function(networkId, address) {
  if (!networkId || !address) { return null }
  let account
  let json = localStorage.getItem(`account-${address.toLowerCase()}`)

  if (json && (json !== null)) {
    account = setAccountLocalStorage(networkId, address, JSON.parse(json))
    console.log(account)
  }

  // delete the old key/val
  localStorage.removeItem(`account-${address.toLowerCase()}`)

  return account
}
