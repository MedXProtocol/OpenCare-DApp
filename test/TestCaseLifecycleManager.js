const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const CaseLifecycleManager = artifacts.require('CaseLifecycleManager.sol')
const createCase = require('./helpers/create-case')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')
const increaseTime = require('./helpers/increaseTime')

contract('CaseLifecycleManager', function (accounts) {
  let caseInstance
  let env

  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let doctor3 = accounts[3]
  let caseFeeWei
  let secondsInADay

  before(async () => {
    env = await createEnvironment(artifacts)

    await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc', 'CA', 'AB', true)
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Doogie', 'US', 'CO', true)
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'US', 'CO', true)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
    secondsInADay = (await env.caseScheduleManager.secondsInADay()).toNumber()

    caseFeeWei = await env.casePaymentManager.caseFeeTokenWei(env.weth9.address)

    caseInstance = await Case.at(await createCase(env, patient, doctor))
  })

  describe('patientWithdrawFunds()', () => {
    it('should close the case and refund the patient', async () => {
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))

      await increaseTime(secondsInADay * 3)

      await env.caseLifecycleManager.patientWithdrawFunds(caseInstance.address)
      assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
    })
  })

  describe('patientRequestNewInitialDoctor()', () => {
    it('should set the case to open and update the doc', async () => {
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctor)

      assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseInstance.address)

      await increaseTime(secondsInADay * 3)

      await env.caseLifecycleManager.patientRequestNewInitialDoctor(
        caseInstance.address,
        doctor2,
        'a diff doc encrypted case key'
      )
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctor2)

      assert.equal(await env.caseManager.doctorCasesCount(doctor2), 1)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor2, 0), caseInstance.address)
    })
  })

  describe('diagnoseCase()', () => {
    it('should allow the diagnosing doctor to submit the diagnosis', async () => {
      assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 1)
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      await env.caseLifecycleManager.diagnoseCase(caseInstance.address, 'diagnosis hash', { from: doctor })
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
    })
  })

  context('is diagnosed', () => {
    beforeEach(async () => {
      await env.caseLifecycleManager.diagnoseCase(caseInstance.address, 'diagnosis hash', { from: doctor })
    })

    describe('acceptDiagnosis()', () => {
      it('should allow the patient to accept the diagnosis', async () => {
        assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
        await env.caseLifecycleManager.acceptDiagnosis(caseInstance.address, { from: patient })

        assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())

        // Deposit afterwards to clean up this test
        await env.weth9.withdraw(caseFeeWei, { from: doctor })
      })

      it('should allow the patient to accept diagnosis 24 hours after choosing a challenge doc', async () => {
        let patientBalance = await env.weth9.balanceOf(patient)
        assert.equal(patientBalance, 0)

        assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
        await env.caseLifecycleManager.challengeWithDoctor(
          caseInstance.address,
          doctor2,
          'doctor 2 encrypted case key',
          { from: patient }
        )
        assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))

        await increaseTime(secondsInADay * 3)

        await env.caseLifecycleManager.acceptDiagnosis(caseInstance.address, { from: patient })
        assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
        assert.equal(await env.caseStatusManager.openCaseCount.call(doctor2), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor2), 0)
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

        // patientBalance = await env.weth9.balanceOf(patient)
        // assert.equal(patientBalance, caseFee / 3)

        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())
      })
    })

    describe('acceptAsDoctor()', () => {
      it('after 2 days it should close the case and pay the doctor', async () => {
        assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))

        await increaseTime(secondsInADay * 3)

        await env.caseLifecycleManager.acceptAsDoctor(caseInstance.address, { from: doctor })
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())
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
          assert.equal(await caseInstance.challengingDoctor.call(), doctor2)

          assert.equal(await env.caseManager.doctorCasesCount(doctor2), 1)
          assert.equal(await env.caseManager.doctorCaseAtIndex(doctor2, 0), caseInstance.address)
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

        describe('patientRequestNewChallengeDoctor()', () => {
          it('should set a new challenge doc if the patient waited on the first one for over 24 hours', async () => {
            await increaseTime(secondsInADay * 3)

            await env.caseLifecycleManager.patientRequestNewChallengeDoctor(
              caseInstance.address,
              doctor3,
              'yet another doc encrypted case key'
            )
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctor2), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor2), 0)

            assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))
            assert.equal(await caseInstance.challengingDoctor.call(), doctor3)

            assert.equal(await env.caseManager.doctorCasesCount(doctor3), 1)
            assert.equal(await env.caseManager.doctorCaseAtIndex(doctor3, 0), caseInstance.address)
          })
        })

        describe('acceptAsDoctor()', () => {
          it('after 4 days it should close the case and pay the doctor', async () => {
            assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))

            await increaseTime(secondsInADay * 5)

            await env.caseLifecycleManager.acceptAsDoctor(caseInstance.address, { from: doctor })

            assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

            let doctorBalance = await env.weth9.balanceOf(doctor)
            assert.equal(doctorBalance.toString(), caseFeeWei.toString())
          })
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

            assert.equal((await env.weth9.balanceOf(doctor)).toString(), doctorBalance.plus(caseFeeWei).toString())
            assert.equal((await env.weth9.balanceOf(doctor2)).toString(), doctorBalance2.plus(caseFeeWei).div(2).floor().toString())
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
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
            assert.equal(await env.caseStatusManager.openCaseCount.call(doctor2), 0)
            assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor2), 1)

            assert.equal((await env.weth9.balanceOf(patient)).toString(), patientBalance.plus(caseFeeWei).toString())
            assert.equal((await env.weth9.balanceOf(doctor2)).toString(), doctorBalance2.plus(caseFeeWei).div(2).floor().toString())
            // assert.equal(result.receipt.logs[result.receipt.logs.length-1].event, 'CaseDiagnosesDiffer')
          })
        })
      })
    })
  })


})
