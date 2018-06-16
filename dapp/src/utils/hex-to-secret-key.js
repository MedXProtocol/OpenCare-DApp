import BigNumber from 'bignumber.js'

export function hexToSecretKey(hexString) {
  const num = new BigNumber(hexString, 16)
  return num.toString(36)
}
