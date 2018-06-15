import { secretKeyToHex } from '../secret-key-to-hex'

test('Can encrypt and decrypt', () => {
  expect(secretKeyToHex('1pm24x51hwnzmlxrbo02cpaxuftkngbvgbfqpj66c1dfj3quci'))
    .toEqual('44aae6dbac03b38b10b07fa9bcb90721ea38a898b28171dc47da6d7fb8265b22')
})
