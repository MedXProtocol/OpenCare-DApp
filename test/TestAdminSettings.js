const expectThrow = require('./helpers/expectThrow')
const AdminSettings = artifacts.require("./AdminSettings.sol")
const createEnvironment = require('./helpers/create-environment')
const resetCaseManager = require('./helpers/reset-case-manager')
const usageRestrictionToInt = require('./helpers/usageRestrictionToInt')

contract('AdminSettings', function (accounts) {

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
  })

  beforeEach(async () => {
    // default usage restriction is level 1 (Open To Everyone)
    // default beta faucet register doctor is true
    await env.adminSettings.updateAdminSettings(1, true)
  })

  describe('usageRestrictions()', () => {
    it('should return the default Usage Restriction', async () => {
      const currentUsageRestrictions = await env.adminSettings.usageRestrictions.call()
      assert.equal(currentUsageRestrictions, usageRestrictionToInt('Open To Everyone'))
    })
  })

  describe('setUsageRestrictions()', () => {
    it('should update the Usage Restrictions', async () => {
      assert.equal(
        await env.adminSettings.usageRestrictions.call(),
        usageRestrictionToInt('Open To Everyone')
      )

      await env.adminSettings.setUsageRestrictions(2)

      assert.equal(
        await env.adminSettings.usageRestrictions.call(),
        usageRestrictionToInt('Only Doctors')
      )
    })
  })

  describe('setBetaFaucetRegisterDoctor()', () => {
    it('should update the Beta Faucet setting: Users can register themselves as Doctors', async () => {
      assert.equal(await env.adminSettings.betaFaucetRegisterDoctor.call(), true)

      await env.adminSettings.setBetaFaucetRegisterDoctor(false)
      assert.equal(await env.adminSettings.betaFaucetRegisterDoctor.call(), false)
    })
  })

  describe('updateAdminSettings()', () => {
    it('should update all settings', async () => {
      assert.equal(await env.adminSettings.betaFaucetRegisterDoctor.call(), true)

      await env.adminSettings.updateAdminSettings(1, false)
      assert.equal(await env.adminSettings.betaFaucetRegisterDoctor.call(), false)

      assert.equal(
        await env.adminSettings.usageRestrictions.call(),
        usageRestrictionToInt('Open To Everyone')
      )
    })
  })

})
