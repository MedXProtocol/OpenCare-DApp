import { ec } from '~/utils/ec'
import { deriveKeyPair } from '~/services/derive-key-pair'

export function deriveSharedKey(secretKey, publicKey) {
  const privateKeyPair = deriveKeyPair(secretKey)
  const publicKeyPair = ec.keyFromPublic(publicKey, 'hex')
  const combinedKeyPair = privateKeyPair.derive(publicKeyPair.getPublic())
  const sharedKey = combinedKeyPair.toString(16).substring(0, 64)
  return sharedKey
}
