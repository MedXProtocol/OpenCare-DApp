import { deriveKey } from '@/utils/derive-key'
import hasAccount from './has-account'
import { genKey } from './gen-key'
import { setAccount } from './set-account'
import { deriveKeyPair } from './derive-key-pair'
import aes from './aes'

export function buildAccount(secretKey, masterPassword) {
  // Derive more entropy from the masterPassword
  var salt = genKey()
  var preimage = deriveKey(masterPassword, salt)

  // Store the masterPassword salted
  var preimageSalt = genKey()
  var storedMasterPassword = deriveKey(preimage, preimageSalt).toString('hex')
  var encryptedSecretKey = aes.encrypt(secretKey, preimage)

  return {
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
