export const decryptCaseKey = function (account, encryptedCaseKey, caseKeySalt) {
  let caseKey = undefined // undefined caseKey means it's still loading / state is unknown!

  if (encryptedCaseKey && caseKeySalt) {
    caseKey = account.decrypt(encryptedCaseKey.substring(2), caseKeySalt.substring(2))

    // Test if the caseKey is undefined or NaN (if we were able to decrypt it properly)
    // This should be replaced with an HMAC test
    if (isNaN(parseInt(caseKey, 16)) || parseInt(caseKey, 16) === undefined)
      caseKey = null
  }

  return caseKey
}

export const decryptCaseKeyAsync = function (encryptedCaseKey, caseKeySalt, account) {
  return account.decryptAsync(encryptedCaseKey.substring(2), caseKeySalt.substring(2)).then(key => {
    // Test if the caseKey is undefined or NaN (if we were able to decrypt it properly)
    // This should be replaced with an HMAC test
    if (isNaN(parseInt(key, 16)) || parseInt(key, 16) === undefined)
      key = null

    return key
  })
}
