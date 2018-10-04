const expectThrow = require('./helpers/expectThrow')
const CaseManager = artifacts.require("./CaseManager.sol")
const Case = artifacts.require("./Case.sol")
const createEnvironment = require('./helpers/create-environment')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('CaseManager', function (accounts) {
  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let patient2 = accounts[3]

  let env

  let caseCharge = web3.utils.toWei('15', 'ether')

  const ipfsHash = '0x516d61485a4a774243486a54726d3848793244356d50706a64636d5a4d396e5971554e475a6855435368526e5a4a' // generateBytes(50)
  const encryptedCaseKey = '0x265995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f73'
  const caseKeySalt = '0x365995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f74'
  const doctorEncryptedCaseKey = '0xafe987a9ef8a'

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Dr. Octagon', 'CA', 'AB', true)
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. NotADerm', 'US', 'CO', false)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  describe('CaseManager', () => {
    it("should work", async () => {
      const caseManager = await CaseManager.new()
    })
  })

  describe('createAndAssignCase()', () => {
    describe('with weth9', () => {
      it('will not work unless doctor is a dermatologist', async () => {
        expectThrow(async () => {
          await env.caseManager.createAndAssignCase(
            env.weth9.address,
            patient,
            encryptedCaseKey,
            caseKeySalt,
            ipfsHash,
            doctor2,
            doctorEncryptedCaseKey,
            { from: patient, value: caseCharge }
          )
        })
      })

      it('will not work while the system is locked down by AdminSettings', async () => {
        await env.adminSettings.setUsageRestrictions(0)
        expectThrow(async () => {
          await env.caseManager.createAndAssignCase(
            env.weth9.address,
            patient,
            encryptedCaseKey,
            caseKeySalt,
            ipfsHash,
            doctor,
            doctorEncryptedCaseKey,
            { from: patient, value: caseCharge }
          )
        })
      })

      it('will not work unless patient is a doctor w/ AdminSettings UsageRestrictions as OnlyDoctors', async () => {
        await env.adminSettings.setUsageRestrictions(2)
        expectThrow(async () => {
          await env.caseManager.createAndAssignCase(
            env.weth9.address,
            patient,
            encryptedCaseKey,
            caseKeySalt,
            ipfsHash,
            doctor,
            doctorEncryptedCaseKey,
            { from: patient, value: caseCharge }
          )
        })

        assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)
        await env.caseManager.createAndAssignCase(
          env.weth9.address,
          doctor2,
          encryptedCaseKey,
          caseKeySalt,
          ipfsHash,
          doctor,
          doctorEncryptedCaseKey,
          { from: doctor2, value: caseCharge }
        )
        assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)
      })

      it('should work', async () => {
        assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)
        await env.caseManager.createAndAssignCase(
          env.weth9.address,
          patient,
          encryptedCaseKey,
          caseKeySalt,
          ipfsHash,
          doctor,
          doctorEncryptedCaseKey,
          { from: patient, value: caseCharge }
        )

        assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)
        assert.equal(await env.caseManager.getPatientCaseListCount(patient), 1)
        assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)

        let caseAddress = await env.caseManager.patientCases(patient, 0)
        assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseAddress)
        var caseInstance = await Case.at(caseAddress)
        assert.equal(await caseInstance.patient.call(), patient)
        assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      })
    })

    describe('with dai', () => {
      it('should work', async () => {
        await env.dai.mint(patient, web3.utils.toWei('1000', 'ether'))
        const depositTokenWei = await env.casePaymentManager.requiredDepositTokenWei(env.dai.address)
        await env.dai.approve(env.casePaymentManager.address, depositTokenWei, { from: patient })

        await env.caseManager.createAndAssignCase(
          env.dai.address,
          patient,
          encryptedCaseKey,
          caseKeySalt,
          ipfsHash,
          doctor,
          doctorEncryptedCaseKey,
          { from: patient, value: caseCharge }
        )

        assert.equal(await env.caseManager.getPatientCaseListCount(patient), 1)
      })
    })
  })

  describe('createAndAssignCaseWithPublicKey()', () => {
    it('should work', async () => {
      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 0)

      await env.caseManager.createAndAssignCaseWithPublicKey(
        env.weth9.address,
        patient2,
        encryptedCaseKey,
        caseKeySalt,
        ipfsHash,
        doctor,
        doctorEncryptedCaseKey,
        '0xea1234',
        { from: patient2, value: caseCharge }
      )

      assert.equal((await env.caseManager.getAllCaseListCount()).toString(), 1)
      assert.equal(await env.caseManager.getPatientCaseListCount(patient2), 1)
      assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)

      let caseAddress = await env.caseManager.patientCases(patient2, 0)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseAddress)
      var caseInstance = await Case.at(caseAddress)
      assert.equal(await caseInstance.patient.call(), patient2)
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await env.accountManager.publicKeys(patient2), '0xea1234')
    })
  })
})
