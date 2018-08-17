const expectThrow = require('./helpers/expectThrow')
const Registry = artifacts.require("./Registry.sol")
const Case = artifacts.require("./Case.sol")
const CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")
const createEnvironment = require('./helpers/create-environment')
const createCase = require('./helpers/create-case')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CaseScheduleManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, web3.toWei(1000, 'ether'))
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr Xavier')
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
      await resetCaseManager(artifacts, env)
      const caseInstance = await Case.at(await createCase(env, patient, doctor))
      const createdAt = await env.caseScheduleManager.createdAt(caseInstance.address)
      const updatedAt = await env.caseScheduleManager.updatedAt(caseInstance.address)
      assert.notEqual(createdAt, 0)
      assert.equal(updatedAt.toString(), createdAt.toString())
    })
  })
})
