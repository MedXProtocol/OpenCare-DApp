const Case = artifacts.require("./Case.sol")
const CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")
const createEnvironment = require('./helpers/create-environment')
const createCase = require('./helpers/create-case')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CaseScheduleManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr Xavier', 'CA', 'AB', true)
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr Hibbert', 'US', 'CO', true)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  describe('CaseScheduleManager', () => {
    it("should work", async () => {
      const caseScheduleManager = await CaseScheduleManager.new()
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
