export default function (state) {
  if (!state.masterPassword) {
    return 'You must enter a master password'
  } else if (state.masterPassword.length < 8) {
    return 'The master password must be at least 8 characters long'
  } else if (state.masterPassword !== state.confirmMasterPassword) {
    return 'Both passwords must match'
  }
  return false
}
