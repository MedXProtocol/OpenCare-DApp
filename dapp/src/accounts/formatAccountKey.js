export function formatAccountKey(networkId, address) {
  return `account-${networkId}-${address.toLowerCase()}`
}
