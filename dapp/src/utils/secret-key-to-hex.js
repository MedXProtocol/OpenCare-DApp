import BigNumber from 'bignumber.js'

export function secretKeyToHex(secretKey) {
  const num = new BigNumber(secretKey, 36)
  return num.toString(16)
}
