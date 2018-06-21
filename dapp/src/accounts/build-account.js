import { deriveKey } from '~/utils/derive-key'
import { genKey } from '~/services/gen-key'
import aes from '~/services/aes'

export function buildAccount(address, secretKey, masterPassword) {
  secretKey = secretKey.toLowerCase()

  // Derive more entropy from the masterPassword
  var salt = genKey()
  var preimage = deriveKey(masterPassword, salt)

  // Store the masterPassword salted
  var preimageSalt = genKey()
  var storedMasterPassword = deriveKey(preimage, preimageSalt).toString('hex')

  console.log(secretKey, preimage)
  var encryptedSecretKey = aes.encrypt(secretKey, preimage)

  return {
    address,
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
