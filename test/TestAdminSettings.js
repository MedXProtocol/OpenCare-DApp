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

  describe('usageRestrictions()', () => {
    it('should return the default Usage Restriction', async () => {
      const currentUsageRestrictions = await env.adminSettings.usageRestrictions.call()
      assert.equal(currentUsageRestrictions, usageRestrictionToInt('Open To Everyone'))
    })
  })

  describe('setUsageRestrictions()', () => {
    it('should update the Usage Restrictions', async () => {
      await env.adminSettings.setUsageRestrictions(2)

      const currentUsageRestrictions = await env.adminSettings.usageRestrictions.call()
      assert.equal(currentUsageRestrictions, usageRestrictionToInt('Only Doctors'))
    })
  })

})
