import secretKeyInvalid from '../secret-key-invalid'

test('secret keys cannot be empty', () => {
  expect(secretKeyInvalid('')).toEqual('You must enter a secret key')
})

test('secret key must conform to length', () => {
  expect(secretKeyInvalid('ASDF')).toEqual('The secret key must contain 64 characters')
})

test('secret key works for a valid 64 character base 36 number', () => {
  expect(secretKeyInvalid('1234567812345678123456781234567812345678123456781234567812345678')).toEqual(false)
})

test('secret key fails for an invalid 64 character string', () => {
  expect(secretKeyInvalid('123456781234567812345678123456781234567812345678123456781234567G')).toEqual('The secret key is not valid')
})
