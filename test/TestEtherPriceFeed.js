const createEnvironment = require('./helpers/create-environment')

contract('EtherPriceFeed', function (accounts) {
  let env

  before(async () => {
    env = await createEnvironment(artifacts)
  })

  describe('set()', () => {
    it("should work", async () => {
      await env.etherPriceFeed.set(web3.toWei('100.52', 'ether'))
      assert.equal(web3.toDecimal(await env.etherPriceFeed.read()), web3.toWei('100.52', 'ether'))
    })
  })
})
