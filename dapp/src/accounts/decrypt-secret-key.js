import aes from '~/services/aes'
import { deriveKeyAsync } from '~/utils/derive-key'

export default async function decryptSecretKeyAsync(account, masterPassword) {
  var preimage = await deriveKeyAsync(masterPassword, account.salt)
  var storedMasterPassword = (await deriveKeyAsync(preimage, account.preimageSalt)).toString('hex')
  if (account.storedMasterPassword !== storedMasterPassword) {
    throw new Error(`Given master password is incorrect`)
  }
  return aes.decrypt(account.encryptedSecretKey, preimage)
}
