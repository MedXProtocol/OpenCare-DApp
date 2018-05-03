import aes from '../aes'
import aesjs from 'aes-js'
import randomBytes from 'randombytes'

test('Can encrypt and decrypt', () => {
  var keyBytes = randomBytes(16)
  var text = 'hello'

  var cipherHex = aes.encrypt(text, keyBytes)
  expect(cipherHex).not.toEqual(text)

  var decrypted = aes.decrypt(cipherHex, keyBytes)
  expect(decrypted).toEqual(text)
})
