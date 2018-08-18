const expectThrow = require('./helpers/expectThrow')
const Registry = artifacts.require("./Registry.sol")
const Case = artifacts.require("./Case.sol")
const CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")
const createEnvironment = require('./helpers/create-environment')
const createCase = require('./helpers/create-case')
const increaseTime = require('./helpers/increaseTime')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')

const SECONDS_IN_A_DAY = 86400

contract('CaseScheduleManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, web3.toWei(1000, 'ether'))
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr Xavier')
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  describe('CaseScheduleManager', () => {
    it("should work", async () => {
      const caseScheduleManager = await CaseScheduleManager.new()
    })
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await env.caseScheduleManager.initialize(env.registry.address)
      })
    })
  })

  describe('initializeCase()', () => {
    it('should assign timestamps', async () => {
      const caseInstance = await Case.at(await createCase(env, patient, doctor))
      const createdAt = await env.caseScheduleManager.createdAt(caseInstance.address)
      const updatedAt = await env.caseScheduleManager.updatedAt(caseInstance.address)
      assert.notEqual(createdAt, 0)
      assert.equal(updatedAt.toString(), createdAt.toString())
    })
  })

  describe('patientWithdrawFunds()', () => {
    it('should close the case and refund the patient', async () => {
      const increaseTime = require('./helpers/increaseTime')

      const caseInstance = await Case.at(await createCase(env, patient, doctor))

      increaseTime(SECONDS_IN_A_DAY * 3)

      env.caseScheduleManager.patientWithdrawFunds(caseInstance.address)
      assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
    })
  })

})
