const expectThrow = require('./helpers/expectThrow')
const createEnvironment = require('./helpers/create-environment')
const Case = artifacts.require('Case.sol')
const createCase = require('./helpers/create-case')
const caseStatus = require('./helpers/case-status')
const resetCaseManager = require('./helpers/reset-case-manager')
const increaseTime = require('./helpers/increaseTime')

contract('CaseDiagnosingDoctor', function (accounts) {

  let env

  let patient = accounts[0]
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let doctor3 = accounts[3]
  let caseFeeWei
  let secondsInADay

  before(async () => {
    env = await createEnvironment(artifacts)

    caseFeeWei = await env.casePaymentManager.caseFeeTokenWei(env.weth9.address)
    secondsInADay = (await env.caseScheduleManager.secondsInADay()).toNumber()

    await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc', 'CA', 'AB', true)
    await env.doctorManager.addOrReactivateDoctor(doctor, 'Doogie', 'US', 'CO', true)
    await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'US', 'CO', true)
    await env.doctorManager.addOrReactivateDoctor(doctor3, 'Dr. Egg Sandwich', 'AB', '', false)
  })

  beforeEach(async () => {
    await resetCaseManager(artifacts, env)
  })

  // Yes, Diagnosing Doctor Can Force Accept
  // 1. doctor 1 diagnosed, no challenge, 48+ hours       (caseInstance1)
  // 2. doctor 1 diagnosed, patient challenged, 96+ hours (caseInstance2)
  //
  // No, Diagnosing Doctor _Cannot_ Force Accept
  //
  // 3. doctor 1 diagnosed, no challenge, less than 48 hours
  // 4. doctor 1 diagnosed, patient challenged, less than 96 hours
  describe('acceptAllAsDoctor()', () => {
    it('cannot be run unless Doctor is a Dermatologist', async () => {
      expectThrow(async () => {
        await env.caseDiagnosingDoctor.acceptAllAsDoctor({ from: doctor3 })
      })
    })

    it('after 2 or 4 days it should close all cases and pay the doctor', async () => {
      //// FIRST CASE DIAGNOSED
      const caseInstance1 = await Case.at(await createCase(env, patient, doctor))
      await env.caseLifecycleManager.diagnoseCase(
        caseInstance1.address,
        'diagnosis hash',
        { from: doctor }
      )

      //// SECOND CASE DIAGNOSED, CHALLENGED
      const caseInstance2 = await Case.at(await createCase(env, patient, doctor))
      await env.caseLifecycleManager.diagnoseCase(
        caseInstance2.address,
        'diagnosis hash',
        { from: doctor }
      )
      await env.caseLifecycleManager.challengeWithDoctor(
        caseInstance2.address,
        doctor2,
        'doctor 2 encrypted case key',
        { from: patient }
      )

      //// START TESTING 'ALL' LOOP
      let result = await env.caseDiagnosingDoctor.acceptAllAsDoctor({ from: doctor })

      assert.equal((await caseInstance1.status.call()).toString(), caseStatus('Evaluated'))
      assert.equal((await caseInstance2.status.call()).toString(), caseStatus('Challenging'))

      let doctorBalance = await env.weth9.balanceOf(doctor)
      assert.equal(doctorBalance.toString(), '0')


      //// Move 3 days into the future & run it again
      await increaseTime(secondsInADay * 3)
      result = await env.caseDiagnosingDoctor.acceptAllAsDoctor({ from: doctor })

      doctorBalance = await env.weth9.balanceOf(doctor)
      // console.log(doctorBalance.toString(), caseFeeWei.toString())
      assert.equal(doctorBalance.toString(), caseFeeWei.toString())

      assert.equal((await caseInstance1.status.call()).toString(), caseStatus('Closed'))
      assert.equal((await caseInstance2.status.call()).toString(), caseStatus('Challenging'))


      //// This time, 2 days in the future (5 days total)
      await increaseTime(secondsInADay * 2)
      await env.caseDiagnosingDoctor.acceptAllAsDoctor({ from: doctor })

      doctorBalance = await env.weth9.balanceOf(doctor)
      // console.log(doctorBalance, (caseFeeWei * 2))
      assert.equal(doctorBalance.toString(), (caseFeeWei * 2))

      assert.equal((await caseInstance1.status.call()).toString(), caseStatus('Closed'))
      assert.equal((await caseInstance2.status.call()).toString(), caseStatus('Closed'))
    })
  })

})
