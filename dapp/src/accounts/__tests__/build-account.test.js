import { buildAccount } from '../build-account'
import { genKey } from '~/services/gen-key'
import randomBytes from 'randombytes'

jest.mock('../../services/gen-key')
jest.mock('../../utils/derive-key')

describe('buildAccount()', () => {
  it('should accept any case in the secret key', () => {
    const bytes = randomBytes(32)
    const secretKey = Buffer.from(bytes).toString('hex')
    console.log('SecretKey ', secretKey)
    const lower = buildAccount('0x1234', secretKey.toLowerCase(), 'masterPassword')
    const upper = buildAccount('0x1234', secretKey.toUpperCase(), 'masterPassword')
    expect(lower.encryptedSecretKey).toEqual(upper.encryptedSecretKey)
  })
})
