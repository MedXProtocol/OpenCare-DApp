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
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-factory')

contract('CaseManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let patient2 = accounts[3]

  let env

  const ipfsHash = '0x516d61485a4a774243486a54726d3848793244356d50706a64636d5a4d396e5971554e475a6855435368526e5a4a' // generateBytes(50)
  const encryptedCaseKey = '0x265995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f73'
  const caseKeySalt = '0x365995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f74'

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, 1000000000000)
    await env.medXToken.mint(patient2, 1000000000000)
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr. Octagon')
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Zaius')
  })

  beforeEach(async () => {
    env.caseManager = await resetCaseManager(artifacts, env)
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await env.caseManager.initialize(10, env.medXToken.address, env.registry.address)
      })
    })
  })

  describe('createAndAssignCase()', () => {
    it('should work', async () => {
      var hexData = env.caseManager.contract.createAndAssignCase.getData(
        '42',
        encryptedCaseKey,
        caseKeySalt,
        ipfsHash,
        doctor,
        'doctor encrypted case key'
      )

      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)
      await env.medXToken.approveAndCall(env.caseManager.address, 15, hexData, { from: patient })
      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)
      assert.equal(await env.caseManager.getPatientCaseListCount(patient), 1)
      assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)

      let caseAddress = await env.caseManager.patientCases(patient, 0)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseAddress)
      var caseInstance = await Case.at(caseAddress)
      assert.equal(await caseInstance.encryptedCaseKey(), encryptedCaseKey)
      assert.equal(await caseInstance.caseDataHash.call(), ipfsHash)
      assert.equal(await caseInstance.patient.call(), patient)
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
    })
  })

  describe('createAndAssignCaseWithPublicKey()', () => {
    it('should work', async () => {
      var hexData = env.caseManager.contract.createAndAssignCaseWithPublicKey.getData(
        '46',
        encryptedCaseKey,
        caseKeySalt,
        ipfsHash,
        doctor,
        'doctor encrypted case key',
        '0xea1234'
      )

      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)
      await env.medXToken.approveAndCall(env.caseManager.address, 15, hexData, { from: patient2 })
      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)
      assert.equal(await env.caseManager.getPatientCaseListCount(patient2), 1)
      assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)

      let caseAddress = await env.caseManager.patientCases(patient2, 0)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseAddress)
      var caseInstance = await Case.at(caseAddress)
      assert.equal(await caseInstance.encryptedCaseKey(), encryptedCaseKey)
      assert.equal(await caseInstance.caseDataHash.call(), ipfsHash)
      assert.equal(await caseInstance.patient.call(), patient2)
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await env.accountManager.publicKeys(patient2), '0xea1234')
    })
  })
})
