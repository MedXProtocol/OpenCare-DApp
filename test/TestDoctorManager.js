const expectThrow = require('./helpers/expectThrow')
const DoctorManager = artifacts.require("./DoctorManager.sol")

contract('DoctorManager', function (accounts) {
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let doctor3 = accounts[3]

  let doctorManager

  beforeEach(async () => {
    doctorManager = await DoctorManager.new()
  })

  describe('initialize()', () => {
    it('should not be called again', () => {
      expectThrow(async () => {
        await doctorManager.initialize()
      })
    })
  })

  describe('addOrReactivateDoctor()', () => {
    it('should work', async () => {
      await doctorManager.addOrReactivateDoctor(doctor, 'Doogie')
      assert.equal(await doctorManager.doctorCount.call(), 1)
      assert.equal(await doctorManager.isDoctor(doctor), true)
      assert.equal(await doctorManager.doctorNames.call(0), 'Doogie')
      assert.equal(await doctorManager.name.call(doctor), 'Doogie')
    })

    it('should not allow double adds', async () => {
      await doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert')
      expectThrow(async () => {
        await doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert')
      })
    })
  })

  describe('deactivateDoctor()', () => {
    it('should work', async () => {
      await doctorManager.addOrReactivateDoctor(doctor3, 'Howser')
      assert.equal(await doctorManager.isActive(doctor3), true)

      await doctorManager.deactivateDoctor(doctor3)
      assert.equal(await doctorManager.isActive(doctor3), false)
    })

    it('should not work on non-doctor', async () => {
      expectThrow(async () => {
        await doctorManager.deactivateDoctor(doctor3, 'Dr. Hibbert')
      })
    })

    it('should reactivate instead of add and update name', async () => {
      await doctorManager.addOrReactivateDoctor(doctor3, 'Howser')
      assert.equal(await doctorManager.doctorCount.call(), 1)

      await doctorManager.deactivateDoctor(doctor3)
      assert.equal(await doctorManager.isActive(doctor3), false)

      await doctorManager.addOrReactivateDoctor(doctor3, 'Newby')
      assert.equal(await doctorManager.doctorNames.call(0), 'Newby')
      assert.equal(await doctorManager.name.call(doctor3), 'Newby')
    })
  })

})
