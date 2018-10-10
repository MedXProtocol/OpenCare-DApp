const expectThrow = require('./helpers/expectThrow')
const Case = artifacts.require("./Case.sol")
const CaseStub = artifacts.require('./CaseStub.sol')
const createEnvironment = require('./helpers/create-environment')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CasePaymentManager', function (accounts) {
  const patient = accounts[0]

  let env

  before(async () => {
    env = await createEnvironment(artifacts)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  describe('initializeCase()', () => {
    describe('with dai', () => {
      it('should work', async () => {
        // Make sure the patient has DAI
        await env.dai.mint(patient, web3.toWei('1000', 'ether'))
        // approve of the spend by the CasePaymentManager
        const requiredDepositWei = await env.casePaymentManager.requiredDepositTokenWei(env.dai.address)
        await env.dai.approve(env.casePaymentManager.address, requiredDepositWei, { from: patient })
        // Create a new fake case
        const caseStub = await CaseStub.new(patient)

        // Initialize the case
        await env.casePaymentManager.initializeCase(caseStub.address, env.dai.address)

        assert.equal((await env.dai.balanceOf(caseStub.address)).toString(), requiredDepositWei.toString())
      })
    })

    describe('with weth9', () => {
      it('should work', async () => {
        const requiredDepositWei = await env.casePaymentManager.requiredDepositTokenWei(env.weth9.address)

        // Create a new fake case
        const caseStub = await CaseStub.new(patient)

        // Initialize the case
        await env.casePaymentManager.initializeCase(caseStub.address, env.weth9.address, {
          value: requiredDepositWei
        })

        assert.equal((await caseStub.deposited()).toString(), requiredDepositWei.toString())
      })
    })
  })

  describe('caseFeeTokenWei()', () => {
    it('should return the Dai cost', async () => {
      assert.equal(
        (await env.casePaymentManager.caseFeeTokenWei(env.dai.address)).toString(),
        web3.toWei('10', 'ether')
      )
    })

    it('should return the W-ETH cost', async () => {
      assert.equal(
        (await env.casePaymentManager.caseFeeTokenWei(env.weth9.address)).toString(),
        '33275655530413000'
      )
    })
  })

  describe('requiredDepositTokenWei()', () => {
    it('should return the Dai cost', async () => {
      assert.equal(
        (await env.casePaymentManager.requiredDepositTokenWei(env.dai.address)).toString(),
        web3.toWei('15', 'ether')
      )
    })

    it('should return the W-ETH cost', async () => {
      assert.equal(
        (await env.casePaymentManager.requiredDepositTokenWei(env.weth9.address)).toString(),
        '49913483295619500'
      )
    })
  })

  describe('usdWeiPerEther()', () => {
    it('should pull in the ether price feed', async () => {
      assert.equal((await env.casePaymentManager.usdWeiPerEther()).toString(), web3.toWei('300.52', 'ether'))
    })
  })

  describe('weiPerCase()', () => {
    it('should dynamically calculate the case fee', async () => {
      assert.equal((await env.casePaymentManager.weiPerCase()).toString(), '33275655530413000')
    })
  })

  describe('setBaseCaseFeeUsdWei(uint256)', () => {
    it('should update the base case fee', async () => {
      await env.casePaymentManager.setBaseCaseFeeUsdWei(web3.toWei('20', 'ether'))
      assert.equal((await env.casePaymentManager.weiPerCase()).toString(), '66551311060827000')
    })
  })
})
