import { deriveKeyAsync } from '~/utils/derive-key'

export async function isAccountMasterPassword(account, masterPassword) {
  var preimage = await deriveKeyAsync(masterPassword, account.salt)
  var hashedMasterPassword = (await deriveKeyAsync(preimage, account.preimageSalt)).toString('hex')
  return hashedMasterPassword === account.storedMasterPassword
}
