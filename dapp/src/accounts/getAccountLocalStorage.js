import { formatAccountKey } from './formatAccountKey'

export function getAccountLocalStorage(networkId, address) {
  let json = localStorage.getItem(formatAccountKey(networkId, address))

  if (json) {
    json = JSON.parse(json)
  }
  
  return json
}
