import { promisify } from './helpers/promisify';
const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')

contract('BetaFaucet', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]

  let env
  let betaFaucetInstance

  before(async () => {
    env = await createEnvironment(artifacts)
    betaFaucetInstance = env.betaFaucet
    betaFaucetInstance.updateMedXTokenAddress(env.medXToken.address)
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.betaFaucetInstance.initialize()
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
      await betaFaucetInstance.send(web3.toWei(50, "ether"));

      let contractBalance = await promisify(cb => web3.eth.getBalance(betaFaucetInstance.address, cb));
      let startingBalance = await promisify(cb => web3.eth.getBalance(recipient, cb));

      await betaFaucetInstance.sendEther(recipient)

      let newBalance = await promisify(cb => web3.eth.getBalance(recipient, cb));

      startingBalance = startingBalance.add(100000000000000000) // 0.1 ether

      assert.equal(
        newBalance.toFormat(2, 1).toString(),
        startingBalance.toFormat(2, 1).toString()
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.sendEther(recipient2)
      expectThrow(async () => {
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
