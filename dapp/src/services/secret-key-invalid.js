import { secretKeyToHex } from '~/utils/secret-key-to-hex'

export default function (secretKey) {
  if (!secretKey) {
    return 'You must enter a secret key'
  }
  if (secretKey.length !== 50) {
    return 'The secret key must contain 50 characters'
  }
  try {
    secretKeyToHex(secretKey)
  } catch (error) {
    return 'The secret key is not valid'
  }
  return false
}
