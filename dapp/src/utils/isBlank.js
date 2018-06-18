export function isBlank(value) {
  return !value || value === '0x' || value === '0x0000000000000000000000000000000000000000'
}
