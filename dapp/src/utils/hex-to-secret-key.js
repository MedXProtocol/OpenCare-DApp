import BN from 'bn.js'

export function hexToSecretKey(hexString) {
  const num = new BN(hexString, 16)
  return num.toString(36)
}
