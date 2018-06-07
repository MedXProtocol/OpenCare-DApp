import { deriveKey } from '~/utils/derive-key'
import { genKey } from './gen-key'
import aes from './aes'

export function buildAccount(address, secretKey, masterPassword) {
  // Derive more entropy from the masterPassword
  var salt = genKey()
  var preimage = deriveKey(masterPassword, salt)

  // Store the masterPassword salted
  var preimageSalt = genKey()
  var storedMasterPassword = deriveKey(preimage, preimageSalt).toString('hex')
  var encryptedSecretKey = aes.encrypt(secretKey, preimage)

  return {
    address,
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
