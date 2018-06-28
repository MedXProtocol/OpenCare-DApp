import { hashWithSalt } from '~/services/hashWithSalt'
import aes from '~/services/aes'

export function buildAccount(address, secretKey, masterPassword) {
  secretKey = secretKey.toLowerCase()

  // Hash the secret key so we can compare it on following sign ins
  let [ hashedSecretKey, secretKeySalt ] = hashWithSalt(secretKey)
  hashedSecretKey = hashedSecretKey.toString('hex')

  // Derive more entropy from the masterPassword
  const [ preimage, salt ] = hashWithSalt(masterPassword)

  // Store the masterPassword salted
  let [ storedMasterPassword, preimageSalt ] = hashWithSalt(preimage)
  storedMasterPassword = storedMasterPassword.toString('hex')

  // console.log(secretKey, preimage)
  const encryptedSecretKey = aes.encrypt(secretKey, preimage)

  return {
    hashedSecretKey,
    secretKeySalt,
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
