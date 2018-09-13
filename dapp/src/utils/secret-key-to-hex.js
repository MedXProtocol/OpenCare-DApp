import BN from 'bn.js'

export function secretKeyToHex(secretKey) {
  const num = new BN(secretKey, 36)
  return num.toString(16)
}
