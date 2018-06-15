const expectThrow = require('./helpers/expectThrow')
const toRegistryKey = require('../migrations/support/to-registry-key')
const Registry = artifacts.require("./Registry.sol")
const Delegate = artifacts.require("./Delegate.sol")
const CaseManager = artifacts.require("./CaseManager.sol")
const MedXToken = artifacts.require("./MedXToken.sol")
const Case = artifacts.require("./Case.sol")
const generateBytes = require('./helpers/generate-bytes')
const createEnvironment = require('./helpers/create-environment')
const createCase = require('./helpers/create-case')
const resetCaseManager = require('./helpers/reset-case-factory')

contract('CaseManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, 1000000000000)
    await env.doctorManager.addDoctor(doctor)
    await env.doctorManager.addDoctor(doctor2)
  })

  beforeEach(async () => {
    env.caseManager = await resetCaseManager(artifacts, env)
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.caseManager.initialize(10, env.medXToken.address, env.registry.address)
      })
    })
  })

  describe('createCase()', () => {
    it('should work', async () => {
      let ipfsHash = '0x516d61485a4a774243486a54726d3848793244356d50706a64636d5a4d396e5971554e475a6855435368526e5a4a' // generateBytes(50)
      let encryptedCaseKey = '0x265995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f73'
      let caseKeySalt = '0x365995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f74'
      var hexData = env.caseManager.contract.createCase.getData(patient, encryptedCaseKey, caseKeySalt, ipfsHash)

      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)

      await env.medXToken.approveAndCall(env.caseManager.address, 15, hexData)

      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)

      let caseAddress = await env.caseManager.patientCases(patient, 0)
      var caseInstance = await Case.at(caseAddress)
      var caseEncryptedCaseKey = await caseInstance.encryptedCaseKey()

      assert.equal(caseEncryptedCaseKey, encryptedCaseKey)
      assert.equal(await caseInstance.caseDetailLocationHash.call(), ipfsHash)
    })
  })

  describe('openCaseCount()', () => {
    it('should return zero when empty', async () => {
      assert.equal(await env.caseManager.openCaseCount(), 0)
    })

    it('should return the count when one exists', async () => {
      await createCase(env, patient)
      assert.equal(await env.caseManager.openCaseCount(), 1)
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
      await env.caseManager.requestNextCase({ from: doctor })
      await new Promise((resolve, reject) => {
        caseAuthorizationRequested.watch((error, result) => {
          if (error) { reject(error) }
          else { resolve(result); caseAuthorizationRequested.stopWatching(); }
        })
      }).then((result) => {
        assert.equal(result.event, 'CaseAuthorizationRequested')
        assert.equal(result.args.doctor, doctor)
      })
      assert.equal(await env.caseManager.openCaseCount(), 0)
      assert.equal(await env.caseManager.doctorAuthorizationRequestCount(doctor), 1)
      assert.equal(await env.caseManager.doctorAuthorizationRequestCaseAtIndex(doctor, 0), caseContract.address)
    })

    describe('for case that has been diagnosed and challenged', () => {
      beforeEach(async () => {
        await env.caseManager.requestNextCase({ from: doctor })
        await caseContract.authorizeDiagnosisDoctor(doctor, 'encryptedCaseKey', { from: patient })
        await caseContract.diagnoseCase('diagnosisHash', { from: doctor })
        await caseContract.challengeDiagnosis({ from: patient })
      })

      it('should not allow the diagnosing doctor to challenge', async () => {
        expectThrow(env.caseManager.requestNextCase({ from: doctor }))
      })

      it('should allow a new doctor to challenge', async () => {
        await env.caseManager.requestNextCase({ from: doctor2 })
      })
    })
  })

  describe('peekNextCase()', () => {
    it('should work', async () => {
      assert.equal(await env.caseManager.peekNextCase({ from: doctor }), 0)
      let address = await createCase(env, patient)
      assert.equal(await env.caseManager.peekNextCase({ from: doctor }), address)
    })
  })
});
