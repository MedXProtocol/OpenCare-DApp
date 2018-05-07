import { deriveKey } from '@/utils/derive-key'
import hasAccount from './has-account'
import { genKey } from './gen-key'
import { setAccount } from './set-account'
import aes from './aes'
import { ec as EC } from 'elliptic'

export function buildAccount(secretKey, masterPassword) {
  // Derive more entropy from the masterPassword
  var salt = genKey()
  var preimage = deriveKey(masterPassword, salt)

  // Store the masterPassword salted
  var preimageSalt = genKey()
  var storedMasterPassword = deriveKey(preimage, preimageSalt).toString('hex')
  var encryptedSecretKey = aes.encrypt(secretKey, preimage)

  // Create EC public key
  // var curve = new EC('p521')
  // var keyPair = curve.genKeyPair({ entropy: secretKey })
  // var publicKey = keyPair.getPublic(true, 'hex')

  return {
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
