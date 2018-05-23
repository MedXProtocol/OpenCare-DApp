export default function(encryptedCaseKeyBytes) {
  if (!encryptedCaseKeyBytes) { return null }
  return encryptedCaseKeyBytes.map((hex) => hex.substring(2)).join('')
}
