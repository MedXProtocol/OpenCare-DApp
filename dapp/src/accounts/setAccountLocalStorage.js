import { formatAccountKey } from './formatAccountKey'

export function setAccountLocalStorage(networkId, address, account) {
  const key = formatAccountKey(networkId, address)
  localStorage.setItem(key, JSON.stringify(account))

  return account
}
