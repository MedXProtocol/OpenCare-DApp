import { Account } from '../Account'

describe('Account', () => {

  let account
  let secretKey = '962c9ad617c687a18e6e0280d09c685b52671e8cde50c1a1e86601287c422ce4'

  beforeEach(() => {
    account = Account.create({
      address: '0xc1a9b3F3c2ce1cc8cF102e665a1Ea99627A20F6e',
      secretKey: secretKey,
      masterPassword: 'whatever'
    })
  })

  test('account.secretKeyWithSaltAsync()', async () => {
    // var now = new Date()
    let salt = '5f72cf960c9999b675668e1673ddfab22c82672a7bc72d376cbfee9d75bc41f2'
    let expectedKey = '36e3f658bec9ccc9379c691e548117deb6fa3bf02fac2af9ee96ad4d866630ae'
    let newKey = await account.secretKeyWithSaltAsync(salt)
    let newKeyString = Buffer.from(newKey).toString('hex')
    expect(newKeyString).toEqual(expectedKey)
    // console.log('secretKeyWithSaltAsync() time: ', (new Date() - now))
  })

  test('account.secretKeyWithSalt()', () => {
    // var now = new Date()
    let salt = '5f72cf960c9999b675668e1673ddfab22c82672a7bc72d376cbfee9d75bc41f0'
    let expectedKey = 'e44f332ece3626a1b210ecfa65733bfc2ff0f0b067f19ad4e5fc98401efbc454'
    let newKey = account.secretKeyWithSalt(salt)
    let newKeyString = Buffer.from(newKey).toString('hex')
    expect(newKeyString).toEqual(expectedKey)
    // console.log('secretKeyWithSalt() time: ', (new Date() - now))
  })

  test('account.secretKey()', () => {
    account._secretKey = 'asdfASDF'
    expect(account.secretKey()).toEqual('asdfasdf')
  })
})
