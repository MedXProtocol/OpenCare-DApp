const createEnvironment = require('./helpers/create-environment')
const debug = require('debug')('TestEtherPriceFeed.js')

contract('EtherPriceFeed', function (accounts) {
  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    debug('Created environment')
  })

  describe('set()', () => {
    it("should work", async () => {
      const value = web3.utils.toWei('100', 'ether')
      await env.etherPriceFeed.set(value)
      debug(`Set the feed value to ${value.toString()}`)
      const readValue = await env.etherPriceFeed.read()
      debug(`Read the feed value as ${readValue.toString()}`)
      assert.equal(web3.utils.toBN(readValue).toString(), value)
    })
  })
})
