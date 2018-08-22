const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const createCase = require('./helpers/create-case')
const generateBytes = require('./helpers/generate-bytes')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')

contract('Case', function (accounts) {
  let caseInstance
  let env

  let patient = accounts[0]
  let doctorAddress
  let doctorAddress2
  let caseFeeWei

  before(async () => {
    env = await createEnvironment(artifacts)

    caseFeeWei = await env.caseManager.caseFeeWei()

    await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc')

    doctorAddress = accounts[1]
    await env.doctorManager.addOrReactivateDoctor(doctorAddress, 'Doogie')

    doctorAddress2 = accounts[2]
    await env.doctorManager.addOrReactivateDoctor(doctorAddress2, 'Dr. Hibbert')
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
    caseInstance = await Case.at(await createCase(env, patient, doctorAddress))
    const diagnosingDoctor = await caseInstance.diagnosingDoctor.call()
    assert.equal(diagnosingDoctor, doctorAddress)
    assert.equal((await env.caseStatusManager.openCaseCount.call(doctorAddress)).toString(), '1')
  })

  describe('initialize()', () => {
    it('should not work twice', async () => {
      assert.equal(await caseInstance.patient.call(), accounts[0])
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctorAddress)
      await expectThrow(async () => {
        await caseInstance.initialize(
          accounts[0], 'alaksefj', 'caseKeySalt', [1, 2], caseFeeWei, env.registry.address
        )
      })
    })
  })

  describe('diagnoseCase()', () => {
    it('should allow the diagnosing doctor to submit the diagnosis', async () => {
      assert.equal(await env.caseStatusManager.openCaseCount.call(doctorAddress), 1)
      await caseInstance.diagnoseCase('diagnosis hash', { from: doctorAddress })
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
      assert(await caseInstance.diagnosisHash.call())
    })
  })

  context('is diagnosed', () => {
    beforeEach(async () => {
      await caseInstance.diagnoseCase('diagnosis hash', { from: doctorAddress })
    })

    describe('acceptDiagnosis()', () => {
      it('should allow the patient to accept the diagnosis', async () => {
        await caseInstance.acceptDiagnosis()
        assert.equal(await env.caseStatusManager.openCaseCount.call(doctorAddress), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctorAddress), 1)
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
        let doctorBalance = await env.weth9.balanceOf(doctorAddress)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())
      })
    })

    describe('challengeWithDoctor()', () => {
      it('should not allow the patient to challenge their own case', async () => {
        await expectThrow(async () => {
          await caseInstance.challengeWithDoctor(patient, 'patient encrypted case key')
        })
      })

      describe('has been set', () => {
        beforeEach(async () => {
          await caseInstance.challengeWithDoctor(doctorAddress2, 'doctor 2 encrypted case key')
          assert.equal(await env.caseStatusManager.openCaseCount.call(doctorAddress2), 1)
          assert.equal(await env.caseStatusManager.closedCaseCount.call(doctorAddress2), 0)
        })

        it('should not be called twice', async () => {
          await expectThrow(async () => {
            await caseInstance.challengeWithDoctor(doctorAddress2, 'doctor 2 encrypted case key')
          })
        })

        it('should allow the patient to challenge a diagnosis', async () => {
          assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))
          assert.equal(await caseInstance.challengingDoctor.call(), doctorAddress2)
        })

        describe('diagnoseChallengedCase()', () => {
          it('on approval should award both doctors', async () => {
            let doctorBalance = await env.weth9.balanceOf(doctorAddress)
            let doctorBalance2 = await env.weth9.balanceOf(doctorAddress2)
            let result = await caseInstance.diagnoseChallengedCase('diagnosis hash', true, { from: doctorAddress2 })
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctorAddress), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctorAddress), 1)
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctorAddress2), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctorAddress2), 1)
            assert(await caseInstance.challengeHash.call())
            assert.equal((await env.weth9.balanceOf(doctorAddress)).toString(), doctorBalance.plus(caseFeeWei).toString())
            assert.equal((await env.weth9.balanceOf(doctorAddress2)).toString(), doctorBalance2.plus(caseFeeWei.div(2).floor()).toString())
            assert.equal(result.logs[result.logs.length-1].event, 'CaseClosedConfirmed')
          })

          it('on rejecting original diagnosis should award the challenge doc', async () => {
            let patientBalance = await env.weth9.balanceOf(patient)
            let doctorBalance2 = await env.weth9.balanceOf(doctorAddress2)
            let result = await caseInstance.diagnoseChallengedCase('diagnosis hash', false, { from: doctorAddress2 })
            assert.equal((await env.weth9.balanceOf(patient)).toString(), patientBalance.plus(caseFeeWei).toString())
            assert.equal((await env.weth9.balanceOf(doctorAddress2)).toString(), doctorBalance2.plus(caseFeeWei.div(2).floor()).toString())
            assert.equal(result.logs[result.logs.length-1].event, 'CaseClosedRejected')
          })
        })
      })
    })
  })
})
