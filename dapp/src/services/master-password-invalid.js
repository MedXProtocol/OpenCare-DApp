export default function (masterPassword) {
  if (!masterPassword) {
    return 'You must enter a master password'
  } else if (masterPassword.length < 8) {
    return 'The master password must be at least 8 characters long'
  }
  return false
}
