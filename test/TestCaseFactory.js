const expectThrow = require('./helpers/expectThrow')
const toRegistryKey = require('../migrations/support/to-registry-key')
const Registry = artifacts.require("./Registry.sol")
const Delegate = artifacts.require("./Delegate.sol")
const CaseFactory = artifacts.require("./CaseFactory.sol")
const MedXToken = artifacts.require("./MedXToken.sol")
const Case = artifacts.require("./Case.sol")
const buildCaseParameters = require('./helpers/build-case-parameters')
const generateBytes = require('./helpers/generate-bytes')
const createEnvironment = require('./helpers/create-environment')

contract('CaseFactory', function (accounts) {
  let registry
  let delegate
  let caseFactory
  let medXToken

  let env

  beforeEach(async () => {
    env = await createEnvironment(artifacts)

    registry = env.registry
    medXToken = env.medXToken

    await medXToken.mint(accounts[0], 1000000000000)
    caseFactory = env.caseFactory
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await caseFactory.initialize(10, medXToken.address, registry.address)
      })
    })
  })

  describe('createCase', () => {
    it('should work', async () => {
      let ipfsHash = generateBytes(50)
      let encryptedCaseKey = generateBytes(64)
      let hexData = buildCaseParameters(ipfsHash, encryptedCaseKey)

      assert.equal((await caseFactory.getAllCaseListCount()).toString(), 0)
      await medXToken.approveAndCall(caseFactory.address, 15, hexData)
      assert.equal((await caseFactory.getAllCaseListCount()).toString(), 1)

      let caseAddress = await caseFactory.patientCases(web3.eth.accounts[0], 0)
      var caseInstance = await Case.at(caseAddress)
      var caseEncryptedCaseKey = await caseInstance.getEncryptedCaseKey()

      assert.equal(Buffer.from(caseEncryptedCaseKey).toString('hex'), Buffer.from(encryptedCaseKey).toString('hex'))
      assert.equal(await caseInstance.caseDetailLocationHash.call(), '0x' + Buffer.from(ipfsHash).toString('hex'))
    })
  })
});
