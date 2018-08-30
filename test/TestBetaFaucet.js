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

  describe('withdrawEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.toWei(20, "ether"))

      const ownerAddress = await betaFaucetInstance.owner.call()

      assert(await web3.eth.getBalance(betaFaucetInstance.address), web3.toWei(20, "ether"))
      assert(await web3.eth.getBalance(ownerAddress), 0)

      await betaFaucetInstance.withdrawEther()
      const ownerBalance = await web3.eth.getBalance(ownerAddress)

      // 1000000 is gas amount in wei
      assert(ownerBalance, web3.toWei(20, "ether") - 1000000)
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.toWei(20, "ether"))
      const recipientBalance = await web3.eth.getBalance(recipient)
      await betaFaucetInstance.sendEther(recipient, web3.toWei(0.2, "ether"))
      const newRecipientBalance = await web3.eth.getBalance(recipient)
      assert.equal(
        newRecipientBalance.toString(),
        recipientBalance.add(web3.toWei(0.2, "ether")).toString()
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.send(web3.toWei(200, "ether"))
      await betaFaucetInstance.sendEther(recipient2, web3.toWei(1, "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient2, web3.toWei(1, "ether"))
      })
    })

    it('should prevent an amount above the limit', async () => {
      await betaFaucetInstance.send(web3.toWei(200, "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient3, web3.toWei(30, "ether"))
      })
    })
  })
  //
  // describe('sendMedX()', () => {
  //   it('should work', async () => {
  //     env.medXToken.mint(betaFaucetInstance.address, 3000000)
  //     const betaFaucetDelegateMedXBalance = await env.medXToken.balanceOf(betaFaucetInstance.address)
  //     assert.equal(betaFaucetDelegateMedXBalance, 3000000)
  //
  //     const medXBalance = await env.medXToken.balanceOf(recipient)
  //     assert.equal(medXBalance, 0)
  //
  //     await betaFaucetInstance.sendMedX(recipient, 15)
  //     const newMedXBalance = await env.medXToken.balanceOf(recipient)
  //     assert.equal(newMedXBalance, 15)
  //   })
  //
  //   it('should not allow double sends', async () => {
  //     await betaFaucetInstance.sendMedX(recipient2, 15)
  //     expectThrow(async () => {
  //       await betaFaucetInstance.sendMedX(recipient2, 15)
  //     })
  //   })
  // })
})
