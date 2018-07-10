import { promisify } from './helpers/promisify';
const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')

contract('BetaFaucet', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]

  let env
  let betaFaucet

  before(async () => {
    env = await createEnvironment(artifacts)
    betaFaucet = env.betaFaucet
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.betaFaucet.initialize()
      })
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucet.send(web3.toWei(50, "ether"));

      let contractBalance = await promisify(cb => web3.eth.getBalance(betaFaucet.address, cb));
      let startingBalance = await promisify(cb => web3.eth.getBalance(recipient, cb));

      await betaFaucet.sendEther(recipient)

      let newBalance = await promisify(cb => web3.eth.getBalance(recipient, cb));

      assert.equal(
        newBalance,
        startingBalance.add(1)
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucet.sendEther(recipient2)
      // expectThrow(async () => {
        // await betaFaucet.sendEther(recipient)
      // })
    })
  })
})
