const expectThrow = require('./helpers/expectThrow')
const toRegistryKey = require('../migrations/support/to-registry-key')
const Registry = artifacts.require("./Registry.sol")
const Delegate = artifacts.require("./Delegate.sol")
const CaseFactory = artifacts.require("./CaseFactory.sol")
const MedXToken = artifacts.require("./MedXToken.sol")
const Case = artifacts.require("./Case.sol")

contract('CaseFactory', function (accounts) {
  let registry
  let delegate
  let caseFactory
  let caseFactoryDelegate
  let caseInstance
  let medXToken

  beforeEach(async () => {
    registry = await Registry.new()
    medXToken = await MedXToken.new()
    await medXToken.mint(accounts[0], 1000000000000)

    caseInstance = await Case.new()
    await registry.register(toRegistryKey('Case'), caseInstance.address)

    caseFactory = await CaseFactory.new()
    await registry.register(toRegistryKey('CaseFactoryTarget'), caseFactory.address)
    delegate = await Delegate.new(registry.address, toRegistryKey('CaseFactoryTarget'))
    caseFactoryDelegate = await CaseFactory.at(delegate.address)
    await caseFactoryDelegate.initialize(10, medXToken.address, registry.address)
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await caseFactoryDelegate.initialize(10, medXToken.address, registry.address)
      })
    })
  })

  describe('createCase', () => {
    it('should work', async () => {
      await medXToken.approveAndCall(caseFactoryDelegate.address, 15, 'documentHash')
      assert.equal((await caseFactoryDelegate.getAllCaseListCount()).toString(), 1)
    })
  })
});
