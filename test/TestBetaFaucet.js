import { promisify } from './helpers/promisify'
const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')

contract('BetaFaucet', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]
  let recipient3 = accounts[3]

  let env
  let betaFaucetInstance

  before(async () => {
    env = await createEnvironment(artifacts)
    betaFaucetInstance = env.betaFaucet
    betaFaucetInstance.updateMedXTokenAddress(env.medXToken.address)
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await betaFaucetInstance.initialize()
      })
    })
  })

  describe('updateMedXTokenAddress()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.betaFaucetInstance.updateMedXTokenAddress(env.medXToken.address)
      })
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.toWei(0.2, "ether"))
      let recipientBalance = await promisify(cb => web3.eth.getBalance(recipient, cb))
      await betaFaucetInstance.sendEther(recipient)
      let newRecipientBalance = await promisify(cb => web3.eth.getBalance(recipient, cb))
      assert.equal(
        newRecipientBalance.toString(),
        recipientBalance.add(web3.toWei(0.1, "ether")).toString()
      )
    })

    it('should not allow double sends', async () => {
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient2)
      })
    })
  })

  describe('sendMedX()', () => {
    it('should work', async () => {
      env.medXToken.mint(betaFaucetInstance.address, 3000000)
      const betaFaucetDelegateMedXBalance = await env.medXToken.balanceOf(betaFaucetInstance.address)
      assert.equal(betaFaucetDelegateMedXBalance, 3000000)

      const medXBalance = await env.medXToken.balanceOf(recipient)
      assert.equal(medXBalance, 0)

      await betaFaucetInstance.sendMedX(recipient)
      const newMedXBalance = await env.medXToken.balanceOf(recipient)
      assert.equal(newMedXBalance, 15)
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.sendMedX(recipient2)
      expectThrow(async () => {
        await betaFaucetInstance.sendMedX(recipient2)
      })
    })
  })
})
