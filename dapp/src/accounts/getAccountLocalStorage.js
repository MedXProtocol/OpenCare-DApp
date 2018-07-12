import { formatLocalStorageAccountKey } from './formatLocalStorageAccountKey'

export function getAccountLocalStorage(address) {
  let json = localStorage.getItem(formatLocalStorageAccountKey(address))
  if (json) {
    json = JSON.parse(json)
  }
  return json
}
