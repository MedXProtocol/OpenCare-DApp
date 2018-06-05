import aes from '@/services/aes'
import { deriveKey } from '@/utils/derive-key'

export default function decryptSecretKey(account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var storedMasterPassword = deriveKey(preimage, account.preimageSalt).toString('hex')
  if (account.storedMasterPassword !== storedMasterPassword) {
    throw new Error(`Given master password is not valid account password`)
  }
  return aes.decrypt(account.encryptedSecretKey, preimage)
}
