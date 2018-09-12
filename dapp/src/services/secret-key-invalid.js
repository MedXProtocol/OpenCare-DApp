import BN from 'bn.js'

export default function (secretKey) {
  if (!secretKey) {
    return 'You must enter a secret key'
  }
  if (secretKey.length !== 64) {
    return 'The secret key must contain 64 characters'
  }
  try {
    var bn = new BN(secretKey, 16)
    bn.toString(16)
  } catch (error) {
    return 'The secret key is not valid'
  }
  return false
}
