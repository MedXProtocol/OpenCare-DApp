export function fixAddress(address) {
  if (address && /[A-Z]/.exec(address)) {
    address = address.toLowerCase()
  }
  return address
}
