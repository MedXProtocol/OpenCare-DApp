export function formatKey (string) {
  return string.match(/.{1,4}/g).join('-')
}
