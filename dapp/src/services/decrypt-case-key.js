export const decryptCaseKeyAsync = async function (account, encryptedCaseKey, caseKeySalt) {
  let caseKey = undefined // undefined caseKey means it's still loading / state is unknown!

  if (encryptedCaseKey && caseKeySalt) {
    caseKey = await account.decryptAsync(encryptedCaseKey.substring(2), caseKeySalt.substring(2))

    // Test if the caseKey is undefined or NaN (if we were able to decrypt it properly)
    // This should be replaced with an HMAC test
    if (isNaN(parseInt(caseKey, 16)) || parseInt(caseKey, 16) === undefined)
      caseKey = null
  }

  return caseKey
}
