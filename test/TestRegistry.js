const toRegistryKey = require('../migrations/support/toRegistryKey')
const Registry = artifacts.require("./Registry.sol")
const DoctorManager = artifacts.require('./DoctorManager.sol')

contract('Registry', function (accounts) {
  let registry
  let doctorManager

  beforeEach(async () => {
    registry = await Registry.new()
    doctorManager = await DoctorManager.new()
  })

  describe('register()', () => {
    it('should add the contract', async () => {
      await registry.register(toRegistryKey('DoctorManagerTarget'), doctorManager.address)
      assert.equal(await registry.lookup(toRegistryKey('DoctorManagerTarget')), doctorManager.address)
    })
  })

  describe('deregister()', () => {
    it('should remove the contract', async () => {
      await registry.register(toRegistryKey('Delegate'), doctorManager.address)
      await registry.deregister(toRegistryKey('Delegate'))
      assert.equal(await registry.lookup(toRegistryKey('Delegate')), 0)
    })
  })
});
