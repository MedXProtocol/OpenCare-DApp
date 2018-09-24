export function fixAddress(address) {
  if (address && /[A-Z]/.test(address)) {
    address = address.toLowerCase()
  }
  return address
}
