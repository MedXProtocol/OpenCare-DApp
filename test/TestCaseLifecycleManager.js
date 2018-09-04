const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const CaseLifecycleManager = artifacts.require('CaseLifecycleManager.sol')
const createCase = require('./helpers/create-case')
const generateBytes = require('./helpers/generate-bytes')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')
const evmIncreaseTime = require('./helpers/evmIncreaseTime')
// const evmSnapshot = require('./helpers/evmSnapshot')
// const evmRevert = require('./helpers/evmRevert')
const getEnv = require('./helpers/GlobalSnapshot')

const SECONDS_IN_A_DAY = 86400

contract('CaseLifecycleManager', function (accounts) {
  let caseInstance
  let env

  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let doctor3 = accounts[3]
  let caseFeeWei

  let snapshotId

  beforeEach(async () => {
    env = getEnv()

    await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc', 'CA', 'AB')
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Doogie', 'US', 'CO')
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'US', 'CO')

    caseFeeWei = await env.caseManager.caseFeeWei()

    caseInstance = await Case.at(await createCase(env, patient, doctor))
    // snapshotId = await evmSnapshot()
  })

  // afterEach(async () => {
    // await evmRevert(snapshotId)
  // })

  describe('initialize()', () => {
    xit('should not work twice', async () => {
      await expectThrow(async () => {
        await env.caseLifecycleManager.initialize(env.registry.address)
      })
    })
  })

  describe('patientWithdrawFunds()', () => {
    xit('should close the case and refund the patient', async () => {
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))

      await evmIncreaseTime(SECONDS_IN_A_DAY * 3)

      env.caseLifecycleManager.patientWithdrawFunds(caseInstance.address)
      assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
      console.log('TIME IS! ************')
      console.log(await env.caseScheduleManager.createdAt(caseInstance.address))
    })
  })

  describe('patientRequestNewInitialDoctor()', () => {
    xit('should set the case to open and update the doc', async () => {
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctor)

      assert.equal(await env.caseManager.doctorCasesCount(doctor), 1)
      assert.equal(await env.caseManager.doctorCaseAtIndex(doctor, 0), caseInstance.address)

      await evmIncreaseTime(SECONDS_IN_A_DAY * 3)

      env.caseLifecycleManager.patientRequestNewInitialDoctor(
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
    xit('should allow the diagnosing doctor to submit the diagnosis', async () => {
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
      xit('should allow the patient to accept the diagnosis', async () => {
        assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
        await env.caseLifecycleManager.acceptDiagnosis(caseInstance.address, { from: patient })

        assert.equal(await env.caseStatusManager.openCaseCount.call(doctor), 0)
        assert.equal(await env.caseStatusManager.closedCaseCount.call(doctor), 1)
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())

        // Deposit afterwards to clean up this test
        env.weth9.withdraw(caseFeeWei, { from: doctor })
      })

      xit('should allow the patient to accept diagnosis 24 hours after choosing a challenge doc', async () => {
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

        await evmIncreaseTime(SECONDS_IN_A_DAY * 3)

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
      xit('after 2 days it should close the case and pay the doctor', async () => {
        assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))

        await evmIncreaseTime(SECONDS_IN_A_DAY * 3)

        env.caseLifecycleManager.acceptAsDoctor(caseInstance.address, { from: doctor })
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

        let doctorBalance = await env.weth9.balanceOf(doctor)
        assert.equal(doctorBalance.toString(), caseFeeWei.toString())
      })
    })

    describe('challengeWithDoctor()', () => {
      xit('should not allow the patient to challenge their own case', async () => {
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

        xit('should not be called twice', async () => {
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
          xit('should set a new challenge doc if the patient waited on the first one for over 24 hours', async () => {
            await evmIncreaseTime(SECONDS_IN_A_DAY * 3)

            env.caseLifecycleManager.patientRequestNewChallengeDoctor(
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
          xit('after 4 days it should close the case and pay the doctor', async () => {
            assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))

            await evmIncreaseTime(SECONDS_IN_A_DAY * 5)

            env.caseLifecycleManager.acceptAsDoctor(caseInstance.address, { from: doctor })

            assert.equal(await caseInstance.status.call(), caseStatus('Closed'))

            let doctorBalance = await env.weth9.balanceOf(doctor)
            assert.equal(doctorBalance.toString(), caseFeeWei.toString())
          })
        })

        describe('diagnoseChallengedCase()', () => {
          xit('on approval should award both doctors', async () => {
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

            // console.log(result.logs)
            // assert.equal(result.logs[result.logs.length-1].event, 'CaseDiagnosisConfirmed')
            // console.log(result.receipt.logs)
            // assert.equal(result.receipt.logs[result.receipt.logs.length-1].event, 'CaseDiagnosisConfirmed')
          })

          xit('on rejecting original diagnosis should award the challenge doc', async () => {
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
