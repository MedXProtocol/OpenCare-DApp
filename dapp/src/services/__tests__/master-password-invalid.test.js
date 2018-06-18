import masterPasswordInvalid from '../master-password-invalid'

test('master passwords cannot be empty', () => {
  expect(masterPasswordInvalid('')).toEqual('You must enter a master password')
})

test('master password must conform to length', () => {
  expect(masterPasswordInvalid('ASDF')).toEqual('The master password must be at least 8 characters long')
})

test('master password is valid for good passwords', () => {
  expect(masterPasswordInvalid('asdffasdffasdffasdffasdffasdffasdffasdffasdffasdff')).toEqual('')
})
