const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const CaseLifecycleManager = artifacts.require('CaseLifecycleManager.sol')
const createCase = require('./helpers/create-case')
const generateBytes = require('./helpers/generate-bytes')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')
const increaseTime = require('./helpers/increaseTime')

const SECONDS_IN_A_DAY = 86400

contract('CaseLifecycleManager', function (accounts) {
  let caseInstance
  let env

  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let caseFee

  before(async () => {
    env = await createEnvironment(artifacts)

    await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc')

    await env.doctorManager.addOrReactivateDoctor(doctor, 'Doogie')
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert')
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)

    caseFee = await env.caseManager.caseFee()

    caseInstance = await Case.at(await createCase(env, patient, doctor))
  })

  describe('initialize()', () => {
    it('should not work twice', async () => {
      await expectThrow(async () => {
        await env.caseLifecycleManager.initialize(env.registry.address)
      })
    })
  })

  describe('diagnoseCase()', () => {
    it('should allow the diagnosing doctor to submit the diagnosis', async () => {
      assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 1)
      await env.caseLifecycleManager.diagnoseCase(caseInstance.address, 'diagnosis hash', { from: doctor })
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
      assert(await caseInstance.diagnosisHash.call())
    })
  })

  context('is diagnosed', () => {
    beforeEach(async () => {
      await env.caseLifecycleManager.diagnoseCase(caseInstance.address, 'diagnosis hash', { from: doctor })
    })

    describe('acceptDiagnosis()', () => {
      it('should allow the patient to accept the diagnosis', async () => {
        await env.caseLifecycleManager.acceptDiagnosis(caseInstance.address, { from: patient })
        assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFee)
      })
    })

    describe('challengeWithDoctor()', () => {
      it('should not allow the patient to challenge their own case', async () => {
        await expectThrow(async () => {
          await env.caseLifecycleManager.challengeWithDoctor(
            caseInstance.address,
            patient,
            'patient encrypted case key'
          )
        })
      })

      describe('has been set', () => {
        beforeEach(async () => {
          await env.caseLifecycleManager.challengeWithDoctor(
            caseInstance.address,
            doctor2,
            'doctor 2 encrypted case key',
            { from: patient }
          )

          assert.equal(await env.caseStatusManager.openCaseCount.call(doctor2), 1)
          assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor2), 0)
          assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))
        })

        it('should not be called twice', async () => {
          await expectThrow(async () => {
            await env.caseLifecycleManager.challengeWithDoctor(
              caseInstance.address,
              doctor2,
              'doctor 2 encrypted case key',
              { from: patient }
            )
          })
        })

        it('should allow the second doctor to submit a challenge diagnosis', async () => {
          assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))
          assert.equal(await caseInstance.challengingDoctor.call(), doctor2)
        })

        describe('diagnoseChallengedCase()', () => {
          it('on approval should award both doctors', async () => {
            let doctorBalance = await env.weth9.balanceOf(doctor)
            let doctorBalance2 = await env.weth9.balanceOf(doctor2)
            let result = await env.caseLifecycleManager.diagnoseChallengedCase(
              caseInstance.address,
              'diagnosis hash',
              true,
              { from: doctor2 }
            )
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctor2), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor2), 1)

            assert(await caseInstance.challengeHash.call())

            assert.equal((await env.weth9.balanceOf(doctor)).toString(), doctorBalance.plus(caseFee).toString())
            assert.equal((await env.weth9.balanceOf(doctor2)).toString(), doctorBalance2.plus(caseFee / 2).toString())

            // console.log(result.logs)
            // assert.equal(result.logs[result.logs.length-1].event, 'CaseDiagnosisConfirmed')
            // console.log(result.receipt.logs)
            // assert.equal(result.receipt.logs[result.receipt.logs.length-1].event, 'CaseDiagnosisConfirmed')
          })

          it('on rejecting original diagnosis should award the challenge doc', async () => {
            let patientBalance = await env.weth9.balanceOf(patient)
            let doctorBalance2 = await env.weth9.balanceOf(doctor2)

            let result = await env.caseLifecycleManager.diagnoseChallengedCase(
              caseInstance.address,
              'diagnosis hash',
              false,
              { from: doctor2 }
            )
            assert.equal((await env.weth9.balanceOf(patient)).toString(), patientBalance.plus(caseFee).toString())
            assert.equal((await env.weth9.balanceOf(doctor2)).toString(), doctorBalance2.plus(caseFee / 2).toString())
            // assert.equal(result.receipt.logs[result.receipt.logs.length-1].event, 'CaseDiagnosesDiffer')
          })
        })
      })
    })
  })

  describe('patientWithdrawFunds()', () => {
    it('should close the case and refund the patient', async () => {
      const caseInstance = await Case.at(await createCase(env, patient, doctor))

      increaseTime(SECONDS_IN_A_DAY * 3)

      env.caseLifecycleManager.patientWithdrawFunds(caseInstance.address)
      assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
    })
  })

  describe('patientRequestNewInitialDoctor()', () => {
    it('should set the case to open and update the doc', async () => {
      const caseInstance = await Case.at(await createCase(env, patient, doctor))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctor)

      increaseTime(SECONDS_IN_A_DAY * 3)

      env.caseLifecycleManager.patientRequestNewInitialDoctor(
        caseInstance.address,
        doctor2,
        'a diff doc encrypted case key'
      )
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctor2)
    })
  })

})
