export default function(encryptedCaseKeyBytes) {
  return encryptedCaseKeyBytes.map((hex) => hex.substring(2)).join('')
}
