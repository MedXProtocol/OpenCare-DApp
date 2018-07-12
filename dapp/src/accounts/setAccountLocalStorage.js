import { formatLocalStorageAccountKey } from './formatLocalStorageAccountKey'

export function setAccountLocalStorage(address, account) {
  const key = formatLocalStorageAccountKey(address)
  localStorage.setItem(key, JSON.stringify(account))
}
