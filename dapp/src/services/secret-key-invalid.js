import BN from 'bn.js'

export default function (secretKey) {
  if (!secretKey) {
    return 'You must enter a secret key'
  }
  if (secretKey.length !== 64) {
    return 'The secret key must contain 64 characters'
  }
  var bn = new BN(secretKey, 16)
  const hex = bn.toString(16)
  if (secretKey !== hex) {
    return 'The secret key is not valid'
  }
  return false
}
