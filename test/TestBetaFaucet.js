import { promisify } from './helpers/promisify'
const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')

contract('BetaFaucet', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]
  let recipient3 = accounts[3]

  let env
  let betaFaucet

  before(async () => {
    env = await createEnvironment(artifacts)
    betaFaucet = env.betaFaucet
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await env.betaFaucet.initialize()
      })
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucet.send(web3.toWei(0.2, "ether"))
      let recipientBalance = await promisify(cb => web3.eth.getBalance(recipient, cb))
      await betaFaucet.sendEther(recipient)
      let newRecipientBalance = await promisify(cb => web3.eth.getBalance(recipient, cb))
      assert.equal(
        newRecipientBalance.toString(),
        recipientBalance.add(web3.toWei(0.1, "ether")).toString()
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucet.sendEther(recipient2)
      await expectThrow(async () => {
        await betaFaucet.sendEther(recipient2)
      })
    })
  })
})
