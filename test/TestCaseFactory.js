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
const createCase = require('./helpers/create-case')
const resetCaseFactory = require('./helpers/reset-case-factory')

contract('CaseFactory', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, 1000000000000)
    await env.doctorManager.addDoctor(doctor)
  })

  beforeEach(async () => {
    env.caseFactory = await resetCaseFactory(artifacts, env)
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.caseFactory.initialize(10, env.medXToken.address, env.registry.address)
      })
    })
  })

  describe('createCase()', () => {
    it('should work', async () => {
      let ipfsHash = generateBytes(50)
      let encryptedCaseKey = generateBytes(64)
      let hexData = buildCaseParameters(ipfsHash, encryptedCaseKey)

      assert.equal((await env.caseFactory.getAllCaseListCount()).toString(), 0)
      await env.medXToken.approveAndCall(env.caseFactory.address, 15, hexData)
      assert.equal((await env.caseFactory.getAllCaseListCount()).toString(), 1)

      let caseAddress = await env.caseFactory.patientCases(patient, 0)
      var caseInstance = await Case.at(caseAddress)
      var caseEncryptedCaseKey = await caseInstance.getEncryptedCaseKey()

      assert.equal(Buffer.from(caseEncryptedCaseKey).toString('hex'), Buffer.from(encryptedCaseKey).toString('hex'))
      assert.equal(await caseInstance.caseDetailLocationHash.call(), '0x' + Buffer.from(ipfsHash).toString('hex'))
    })
  })

  describe('openCaseCount()', () => {
    it('should return zero when empty', async () => {
      assert.equal(await env.caseFactory.openCaseCount(), 0)
    })

    it('should return the count when one exists', async () => {
      await createCase(env, patient)
      assert.equal(await env.caseFactory.openCaseCount(), 1)
    })
  })

  describe('requestNextCase()', () => {
    let caseContract
    let caseAuthorizationRequested

    beforeEach(async () => {
      caseContract = await Case.at(await createCase(env, patient))
      caseAuthorizationRequested = caseContract.CaseAuthorizationRequested()
    })

    it('should pull a case off the queue and auth the doctor', async () => {
      await env.caseFactory.requestNextCase({ from: doctor })
      await new Promise((resolve, reject) => {
        caseAuthorizationRequested.watch((error, result) => {
          if (error) { reject(error) }
          else { resolve(result); caseAuthorizationRequested.stopWatching(); }
        })
      }).then((result) => {
        assert.equal(result.event, 'CaseAuthorizationRequested')
        assert.equal(result.args._caseDoctor, doctor)
      })
      assert.equal(await env.caseFactory.openCaseCount(), 0)
    })
  })
});
