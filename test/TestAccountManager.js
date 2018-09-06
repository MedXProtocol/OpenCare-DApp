import { promisify } from './helpers/promisify'
const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')

contract('AccountManager', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]

  let env, accountManager

  before(async () => {
    env = await createEnvironment(artifacts)
    accountManager = env.accountManager
  })

  describe('setPublicKey()', () => {
    it('should set the public key for a user', async () => {
      await accountManager.setPublicKey(recipient, '0x12341234', {
        from: recipient
      })
      assert.equal(await accountManager.publicKeys(recipient), '0x12341234')
    })

    it('should not allow to be set twice', async () => {
      await accountManager.setPublicKey(recipient2, '0x12341234', {
        from: recipient2
      })
      expectThrow(async () => {
        await accountManager.setPublicKey(recipient2, '0x12341234', {
          from: recipient2
        })
      })

      // except by the owner
      await accountManager.setPublicKey(recipient2, '0x01010101', {
        from: accounts[0]
      })
      assert.equal(await accountManager.publicKeys(recipient2), '0x01010101')
    })
  })
})
