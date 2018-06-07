import aes from '~/services/aes'
import { deriveSharedKey } from '~/services/derive-shared-key'

export default function ({secretKey, doctorPublicKey, encryptedCaseKey}) {
  const caseKey = aes.decrypt(encryptedCaseKey, secretKey)
  const sharedKey = deriveSharedKey(secretKey, doctorPublicKey)
  return aes.encrypt(caseKey, sharedKey)
}
