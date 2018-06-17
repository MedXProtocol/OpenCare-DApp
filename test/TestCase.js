const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const createCase = require('./helpers/create-case')
const generateBytes = require('./helpers/generate-bytes')
const caseStatus = require('./helpers/case-status')

contract('Case', function (accounts) {
  let caseInstance
  let env

  let patient = accounts[0]
  let doctorAddress
  let doctorAddress2
  let caseFee = 10

  before(async () => {
    env = await createEnvironment(artifacts)
    await env.medXToken.mint(patient, 1000000000000)

    doctorAddress = accounts[1]
    await env.doctorManager.addDoctor(doctorAddress)

    doctorAddress2 = accounts[2]
    await env.doctorManager.addDoctor(doctorAddress2)
  })

  beforeEach(async () => {
    caseInstance = await Case.at(await createCase(env, patient))
  })

  describe('initialize()', () => {
    it('should not work twice', async () => {
      assert.equal(await caseInstance.patient.call(), accounts[0])
      assert.equal(await env.doctorManager.isDoctor(doctorAddress), true)
      assert.equal(await caseInstance.status.call(), caseStatus('Open'))
      expectThrow(() => {
        caseInstance.initialize(accounts[0], 'alaksefj', 'caseKeySalt', [1, 2], caseFee, env.medXToken.address, env.registry.address)
      })
    })
  })

  describe('requestDiagnosisAuthorization()', () => {
    it('should allow a doctor to request', async () => {
      await caseInstance.requestDiagnosisAuthorization(doctorAddress).then(async (result) => {
        assert.equal(result.logs[0].event, 'CaseAuthorizationRequested')
        assert.equal(result.logs[0].args.doctor, doctorAddress)
        assert.equal(await caseInstance.status.call(), caseStatus('EvaluationRequest'))
      }).catch((error) => {
        console.error(error)
      })
    })

    it('should not allow a doctor to request twice', async () => {
      await caseInstance.requestDiagnosisAuthorization(doctorAddress)
      await expectThrow(caseInstance.requestDiagnosisAuthorization(doctorAddress))
    })
  })

  describe('setDiagnosingDoctor()', () => {
    it('should set that doctor as the diagnosing doctor', async () => {
      await caseInstance.requestDiagnosisAuthorization(doctorAddress)
      await caseInstance.setDiagnosingDoctor(doctorAddress, 'an encrypted key')
      assert.equal(await caseInstance.diagnosingDoctor.call(), doctorAddress)
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluating'))
    })
  })

  describe('diagnoseCase()', () => {
    beforeEach(async () => {
      await caseInstance.requestDiagnosisAuthorization(doctorAddress)
      await caseInstance.setDiagnosingDoctor(doctorAddress, 'an encrypted key')
    })

    it('should allow the diagnosing doctor to submit the diagnosis', async () => {
      await caseInstance.diagnoseCase('diagnosis hash', { from: doctorAddress })
      assert.equal(await caseInstance.status.call(), caseStatus('Evaluated'))
      assert(await caseInstance.diagnosisHash.call())
    })
  })

  context('is diagnosed', () => {
    beforeEach(async () => {
      await caseInstance.requestDiagnosisAuthorization(doctorAddress)
      await caseInstance.setDiagnosingDoctor(doctorAddress, 'an encrypted key')
      await caseInstance.diagnoseCase('diagnosis hash', { from: doctorAddress })
    })

    describe('acceptDiagnosis()', () => {
      it('should allow the patient to accept the diagnosis', async () => {
        await caseInstance.acceptDiagnosis()
        assert.equal(await caseInstance.status.call(), caseStatus('Closed'))
        let doctorBalance = await env.medXToken.balanceOf(doctorAddress)
        assert.equal(doctorBalance, caseFee)
      })
    })

    describe('challengeDiagnosis', () => {
      it('should allow the patient to challenge a diagnosis', async () => {
        await caseInstance.challengeDiagnosis()
        assert.equal(await caseInstance.status.call(), caseStatus('Challenged'))
      })
    })

    context('and challenged', () => {
      beforeEach(async () => {
        await caseInstance.challengeDiagnosis()
      })

      describe('requestChallengeAuthorization()', () => {
        it('should allow a doctor to request to challenge diagnosis', async () => {
          await caseInstance.requestChallengeAuthorization(doctorAddress2)
          assert.equal(await caseInstance.status.call(), caseStatus('ChallengeRequest'))
        })

        it('should not allow the same doctor to challenge diagnosis', async () => {
          await expectThrow(caseInstance.requestChallengeAuthorization(doctorAddress))
        })
      })

      context('and request auth', () => {
        beforeEach(async () => {
          await caseInstance.requestChallengeAuthorization(doctorAddress2)
        })

        describe('setChallengingDoctor()', () => {
          it('should set that doctor as the second diagnosing doc', async () => {
            await caseInstance.setChallengingDoctor(doctorAddress2, 'encrypted key')
            assert.equal(await caseInstance.challengingDoctor.call(), doctorAddress2)
            assert.equal(await caseInstance.status.call(), caseStatus('Challenging'))
          })
        })

        context('approved', () => {
          beforeEach(async () => {
            await caseInstance.setChallengingDoctor(doctorAddress2, 'encrypted key')
          })

          describe('diagnoseChallengedCase()', () => {
            it('on approval should award both doctors', async () => {
              let doctorBalance = await env.medXToken.balanceOf(doctorAddress)
              let doctorBalance2 = await env.medXToken.balanceOf(doctorAddress2)
              let result = await caseInstance.diagnoseChallengedCase('diagnosis hash', true, { from: doctorAddress2 })
              assert(await caseInstance.challengeHash.call())
              assert.equal((await env.medXToken.balanceOf(doctorAddress)).toString(), doctorBalance.plus(caseFee).toString())
              assert.equal((await env.medXToken.balanceOf(doctorAddress2)).toString(), doctorBalance2.plus(caseFee / 2).toString())
              assert.equal(result.logs[0].event, 'CaseClosedConfirmed')
            })

            it('on rejecting original diagnosis should award the challenge doc', async () => {
              let patientBalance = await env.medXToken.balanceOf(patient)
              let doctorBalance2 = await env.medXToken.balanceOf(doctorAddress2)
              let result = await caseInstance.diagnoseChallengedCase('diagnosis hash', false, { from: doctorAddress2 })
              assert.equal((await env.medXToken.balanceOf(patient)).toString(), patientBalance.plus(caseFee).toString())
              assert.equal((await env.medXToken.balanceOf(doctorAddress2)).toString(), doctorBalance2.plus(caseFee / 2).toString())
              assert.equal(result.logs[0].event, 'CaseClosedRejected')
            })
          })
        })
      })
    })
  })
});
