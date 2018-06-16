import secretKeyInvalid from '../secret-key-invalid'

test('secret keys cannot be empty', () => {
  expect(secretKeyInvalid('')).toEqual('You must enter a secret key')
})

test('secret key must conform to length', () => {
  expect(secretKeyInvalid('ASDF')).toEqual('The secret key must contain 50 characters')
})

test('secret key works for a valid 50 character base 36 number', () => {
  expect(secretKeyInvalid('asdffasdffasdffasdffasdffasdffasdffasdffasdffasdff')).toEqual(false)
})

test('secret key fails for an invalid 50 character string', () => {
  expect(secretKeyInvalid('_sdffasdffasdffasdffasdffasdffasdffasdffasdffasdff')).toEqual('The secret key is not valid')
})
