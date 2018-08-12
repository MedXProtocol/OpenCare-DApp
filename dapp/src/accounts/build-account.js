import { hashWithSaltAsync } from '~/services/hashWithSalt'
import aes from '~/services/aes'

export async function buildAccount(address, secretKey, masterPassword) {
  secretKey = secretKey.toLowerCase()

  // Hash the secret key so we can compare it on following sign ins
  let [ hashedSecretKey, secretKeySalt ] = await hashWithSaltAsync(secretKey)
  hashedSecretKey = hashedSecretKey.toString('hex')

  // Derive more entropy from the masterPassword
  const [ preimage, salt ] = await hashWithSaltAsync(masterPassword)

  // Store the masterPassword salted
  let [ storedMasterPassword, preimageSalt ] = await hashWithSaltAsync(preimage)
  storedMasterPassword = storedMasterPassword.toString('hex')

  // console.log(secretKey, preimage)
  const encryptedSecretKey = aes.encrypt(secretKey, preimage)

  return {
    address,
    hashedSecretKey,
    secretKeySalt,
    salt,
    preimageSalt,
    storedMasterPassword,
    encryptedSecretKey
  }
}
