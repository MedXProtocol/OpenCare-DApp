const toRegistryKey = require('../migrations/support/to-registry-key')
const Registry = artifacts.require("./Registry.sol")
const Delegate = artifacts.require("./Delegate.sol")
const DoctorManager = artifacts.require("./DoctorManager.sol")

contract('Delegate', function (accounts) {
  let registry;
  let delegate;
  let doctorManager;
  let doctorManagerDelegate;

  beforeEach(async () => {
    registry = await Registry.new()
    doctorManager = await DoctorManager.new()
    await registry.register(toRegistryKey('DoctorManagerTarget'), doctorManager.address)
    delegate = await Delegate.new(registry.address, toRegistryKey('DoctorManagerTarget'))
    doctorManagerDelegate = await DoctorManager.at(delegate.address)
  })

  describe('implementation()', () => {
    it('should match the contract address', async () => {
      assert.equal(await delegate.implementation(), doctorManager.address)
    })
  })

  describe('delegated call', () => {
    it('should work', async () => {
      await doctorManagerDelegate.initialize()
      assert.equal(await doctorManagerDelegate.owner.call(), accounts[0])
    })
  })
});
