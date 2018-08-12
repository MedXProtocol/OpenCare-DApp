import aes from '~/services/aes'

export async function reencryptCaseKeyAsync({account, doctorPublicKey, encryptedCaseKey, caseKeySalt}) {
  const caseKey = await account.decryptAsync(encryptedCaseKey, caseKeySalt)
  const sharedKey = account.deriveSharedKey(doctorPublicKey)
  return aes.encrypt(caseKey, sharedKey)
}
