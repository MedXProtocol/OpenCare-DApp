import { buildAccount } from '../build-account'
import { genKey } from '~/services/gen-key'
import randomBytes from 'randombytes'

jest.mock('../../services/gen-key')
jest.mock('../../utils/derive-key')

describe('buildAccount()', () => {
  it('should return the networkId & address', async () => {
    const bytes = randomBytes(32)
    const secretKey = Buffer.from(bytes).toString('hex')
    const account = await buildAccount(1234, '0x1234', secretKey.toUpperCase(), 'masterPassword')
    expect(account.address).toEqual('0x1234')
    expect(account.networkId).toEqual(1234)
  })

  it('should accept any case in the secret key', () => {
    const bytes = randomBytes(32)
    const secretKey = Buffer.from(bytes).toString('hex')
    console.log('SecretKey ', secretKey)
    const lower = buildAccount(1234, '0x1234', secretKey.toLowerCase(), 'masterPassword')
    const upper = buildAccount(1234, '0x1234', secretKey.toUpperCase(), 'masterPassword')
    expect(lower.encryptedSecretKey).toEqual(upper.encryptedSecretKey)
  })
})
