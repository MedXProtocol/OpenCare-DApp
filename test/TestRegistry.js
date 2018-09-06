const toRegistryKey = require('../migrations/support/toRegistryKey')
const Registry = artifacts.require("./Registry.sol")
const Delegate = artifacts.require("./Delegate.sol")

contract('Registry', function (accounts) {
  let registry;
  let delegate;

  beforeEach(async () => {
    registry = await Registry.new()
    delegate = await Delegate.new(registry.address, toRegistryKey('Target'))
  })

  describe('register()', () => {
    it('should add the contract', async () => {
      await registry.register(toRegistryKey('Delegate'), delegate.address)
      assert.equal(await registry.lookup(toRegistryKey('Delegate')), delegate.address)
    })
  })

  describe('deregister()', () => {
    it('should remove the contract', async () => {
      await registry.register(toRegistryKey('Delegate'), delegate.address)
      await registry.deregister(toRegistryKey('Delegate'))
      assert.equal(await registry.lookup(toRegistryKey('Delegate')), 0)
    })
  })
});
