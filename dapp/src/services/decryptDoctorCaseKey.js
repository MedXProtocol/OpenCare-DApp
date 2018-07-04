import aes from '~/services/aes'

export const decryptDoctorCaseKey = function (account, patientPublicKey, encryptedCaseKey) {
  let caseKey = undefined // undefined caseKey means it's still loading / state is unknown!

  if (account && patientPublicKey && encryptedCaseKey) {
    const sharedKey = account.deriveSharedKey(patientPublicKey.substring(2))

    caseKey = aes.decrypt(encryptedCaseKey.substring(2), sharedKey)

    // Test if the caseKey is undefined or NaN (if we were able to decrypt it properly)
    // This should be replaced with an HMAC test
    if (isNaN(parseInt(caseKey, 16)) || parseInt(caseKey, 16) === undefined)
      caseKey = null
  }

  return caseKey
}
