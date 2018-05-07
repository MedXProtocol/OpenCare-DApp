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
      var encryptedCaseKey = Array.apply(null, {length: 64}).map(Number.call, Number)
      var ipfsHash = Array.apply(null, {length: 50}).map(Number.call, Number)
      var extraData = encryptedCaseKey.concat(ipfsHash)
      var buffer = Buffer.from(extraData)
      var hexData = '0x' + buffer.toString('hex')
      await medXToken.approveAndCall(caseFactoryDelegate.address, 15, hexData)
      assert.equal((await caseFactoryDelegate.getAllCaseListCount()).toString(), 1)

      let caseAddress = await caseFactoryDelegate.patientCases(web3.eth.accounts[0], 0)
      var caseInstance = await Case.at(caseAddress)
      var encryptedCaseKey = await caseInstance.getEncryptedCaseKey()

      assert.equal(Buffer.from(encryptedCaseKey).toString('hex'), Buffer.from(encryptedCaseKey).toString('hex'))
      assert.equal(await caseInstance.caseDetailLocationHash.call(), '0x' + Buffer.from(ipfsHash).toString('hex'))
    })
  })
});
