const Case = artifacts.require("./Case.sol")
const MedXToken = artifacts.require("./MedXToken.sol")
const Registry = artifacts.require("./Registry.sol")
const expectThrow = require('./helpers/expectThrow')

contract('Case', function (accounts) {
  let caseInstance;
  let registry
  let medXToken

  beforeEach(async () => {
    caseInstance = await Case.new()
    registry = await Registry.new()
    medXToken = await MedXToken.new()

    await caseInstance.initialize(accounts[0], 'alaksefj', [1, 2], 10, medXToken.address, registry.address)
  })

  describe('initialize()', () => {
    it('should not work twice', async () => {
      expectThrow(() => {
        caseInstance.initialize(accounts[0], 'alaksefj', [1, 2], 10, medXToken.address, registry.address)
      })
    })
  })
});
