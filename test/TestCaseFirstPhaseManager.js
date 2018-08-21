const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const CaseFirstPhaseManager = artifacts.require('CaseFirstPhaseManager.sol')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CaseFirstPhaseManager', function (accounts) {
  let env

  before(async () => {
    env = await createEnvironment(artifacts)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  describe('initialize()', () => {
    it('should not work twice', async () => {
      await expectThrow(async () => {
        await env.caseFirstPhaseManager.initialize(env.registry.address)
      })
    })
  })

  // This contract is tested by it's external interface: CaseLifecycleManager

})
