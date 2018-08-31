const expectThrow = require('./helpers/expectThrow')
const Registry = artifacts.require("./Registry.sol")
const Case = artifacts.require("./Case.sol")
const CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")
const createEnvironment = require('./helpers/create-environment')
const createCase = require('./helpers/create-case')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CaseScheduleManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    // await env.medXToken.mint(patient, web3.toWei(1000, 'ether'))
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr Xavier', 'CA', 'AB')
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr Hibbert', 'US', 'CO')
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

})
