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

contract('DoctorManager', function (accounts) {
  let doctor = accounts[1]
  let doctor2 = accounts[2]

  let env
  let doctorManager

  before(async () => {
    env = await createEnvironment(artifacts)
    doctorManager = env.doctorManager
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await env.doctorManager.initialize()
      })
    })
  })

  describe('addDoctor()', () => {
    it('should work', async () => {
      await doctorManager.addDoctor(doctor)
      assert.equal(await doctorManager.doctorCount.call(), 1)
      assert.equal(await doctorManager.isDoctor(doctor), true)
    })
  })
})
