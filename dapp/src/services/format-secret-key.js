export function formatSecretKey (string) {
  var onlyWordChars = string.replace(/[^\w]/g, '')
  var groupedDigits = onlyWordChars.match(/\w{1,4}/g)
  if (groupedDigits) {
    groupedDigits = groupedDigits.join('-')
  }
  return groupedDigits || ''
}
