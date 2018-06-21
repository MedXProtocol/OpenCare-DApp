import { cacheCallValue } from '~/saga-genesis'

export const decryptCaseKey = function (state, account, caseAddress) {
  let caseKey

  const encryptedCaseKey = cacheCallValue(state, caseAddress, 'encryptedCaseKey')
  const caseKeySalt = cacheCallValue(state, caseAddress, 'caseKeySalt')

  if (encryptedCaseKey && caseKeySalt) {
    caseKey = account.decrypt(encryptedCaseKey.substring(2), caseKeySalt.substring(2))
  }

  // Test if the caseKey is undefined or NaN (if we were able to decrypt it properly)
  // This should be replaced with an HMAC test
  if (isNaN(parseInt(caseKey, 16)) || parseInt(caseKey, 16) === undefined)
    caseKey = null

  return caseKey
}
