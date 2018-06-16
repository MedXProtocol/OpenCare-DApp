import aes from '~/services/aes'

export default function ({account, doctorPublicKey, encryptedCaseKey}) {
  const caseKey = account.decrypt(encryptedCaseKey)
  const sharedKey = account.deriveSharedKey(doctorPublicKey)
  return aes.encrypt(caseKey, sharedKey)
}
