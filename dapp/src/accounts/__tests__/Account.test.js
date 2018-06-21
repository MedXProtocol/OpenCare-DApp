import { Account } from '../Account'

describe('Account', () => {
  test('account.secretKey()', () => {
    const account = new Account()
    account._secretKey = 'asdfASDF'
    expect(account.secretKey()).toEqual('asdfasdf')
  })
})
