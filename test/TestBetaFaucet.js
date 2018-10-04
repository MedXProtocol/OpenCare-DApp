import { promisify } from './helpers/promisify'
import BN from 'bn.js'
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

  describe('updateMedXTokenAddress()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.betaFaucetInstance.updateMedXTokenAddress(env.medXToken.address)
      })
    })
  })

  describe('withdrawEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.utils.toWei('20', "ether"))

      const ownerAddress = await betaFaucetInstance.owner.call()

      assert(await web3.eth.getBalance(betaFaucetInstance.address), web3.utils.toWei('20', "ether"))
      assert(await web3.eth.getBalance(ownerAddress), 0)

      await betaFaucetInstance.withdrawEther()
      const ownerBalance = await web3.eth.getBalance(ownerAddress)

      // 1000000 is gas amount in wei
      assert(ownerBalance, web3.utils.toWei('20', "ether") - 1000000)
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.utils.toWei('20', "ether"))
      const recipientBalance = new BN(await web3.eth.getBalance(recipient))
      await betaFaucetInstance.sendEther(recipient, web3.utils.toWei('0.2', "ether"))
      const newRecipientBalance = new BN(await web3.eth.getBalance(recipient))
      assert.equal(
        newRecipientBalance.toString(),
        recipientBalance.add(new BN(web3.utils.toWei('0.2', "ether"))).toString()
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.send(web3.utils.toWei('200', "ether"))
      await betaFaucetInstance.sendEther(recipient2, web3.utils.toWei('1', "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient2, web3.utils.toWei('1', "ether"))
      })
    })

    it('should prevent an amount above the limit', async () => {
      await betaFaucetInstance.send(web3.utils.toWei('200', "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient3, web3.utils.toWei('30', "ether"))
      })
    })
  })

})
