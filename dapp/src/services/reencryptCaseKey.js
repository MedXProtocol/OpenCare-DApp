import aes from '~/services/aes'

export function reencryptCaseKey({account, doctorPublicKey, encryptedCaseKey, caseKeySalt}) {
  const caseKey = account.decrypt(encryptedCaseKey, caseKeySalt)
  const sharedKey = account.deriveSharedKey(doctorPublicKey)
  return aes.encrypt(caseKey, sharedKey)
}
