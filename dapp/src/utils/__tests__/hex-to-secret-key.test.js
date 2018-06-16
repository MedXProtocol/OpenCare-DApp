import { hexToSecretKey } from '../hex-to-secret-key'

test('Can encrypt and decrypt', () => {
  expect(hexToSecretKey('44aae6dbac03b38b10b07fa9bcb90721ea38a898b28171dc47da6d7fb8265b22'))
    .toEqual('1pm24x51hwnzmlxrbo02cpaxuftkngbvgbfqpj66c1dfj3quci')
})
