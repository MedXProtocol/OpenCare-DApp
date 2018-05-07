import { deriveKey } from '@/utils/derive-key'

export function isAccountMasterPassword(account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var hashedMasterPassword = deriveKey(preimage, account.preimageSalt).toString('hex')
  return hashedMasterPassword === account.storedMasterPassword
}
