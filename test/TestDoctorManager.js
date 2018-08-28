const expectThrow = require('./helpers/expectThrow')
const DoctorManager = artifacts.require("./DoctorManager.sol")

contract('DoctorManager', function (accounts) {
  let doctor = accounts[1]
  let doctor2 = accounts[2]
  let doctor3 = accounts[3]
  let doctor4 = accounts[4]

  let doctorManager

  beforeEach(async () => {
    doctorManager = await DoctorManager.new()
    await doctorManager.initialize()
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await doctorManager.initialize()
      })
    })

    it('should set the values at 0', async () => {
      assert.equal(await doctorManager.doctorCount.call(), 1)
    })
  })

  describe('addOrReactivateDoctor()', () => {
    it('should work', async () => {
      await doctorManager.addOrReactivateDoctor(doctor, 'Doogie', 'CA', 'BC')
      assert.equal(await doctorManager.doctorCount.call(), 2)
      assert.equal(await doctorManager.isDoctor(doctor), true)
      assert.equal(await doctorManager.doctorNames.call(1), 'Doogie')
      assert.equal(await doctorManager.name.call(doctor), 'Doogie')
      assert.equal(await doctorManager.doctorCountries.call(1), 'CA')
      assert.equal(await doctorManager.country.call(doctor), 'CA')
      assert.equal(await doctorManager.doctorRegions.call(1), 'BC')
      assert.equal(await doctorManager.region.call(doctor), 'BC')

      await doctorManager.addOrReactivateDoctor(doctor2, 'General Major', 'US', 'DC')
      assert.equal(await doctorManager.doctorCount.call(), 3)
      assert.equal(await doctorManager.isDoctor(doctor2), true)
      assert.equal(await doctorManager.doctorNames.call(2), 'General Major')
      assert.equal(await doctorManager.name.call(doctor2), 'General Major')
      assert.equal(await doctorManager.doctorCountries.call(2), 'US')
      assert.equal(await doctorManager.country.call(doctor2), 'US')
      assert.equal(await doctorManager.doctorRegions.call(2), 'DC')
      assert.equal(await doctorManager.region.call(doctor2), 'DC')
    })

    it('should work without a country or region assigned', async () => {
      await doctorManager.addOrReactivateDoctor(doctor, 'Doogie', '', '')
      assert.equal(await doctorManager.doctorCount.call(), 2)
      assert.equal(await doctorManager.doctorCountries.call(1), '')
      assert.equal(await doctorManager.doctorRegions.call(1), '')
    })

    describe('when doctor added', () => {
      beforeEach(async () => {
        await doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'CA', 'BC')
      })

      it('should not allow double adds', async () => {
        await expectThrow(async () => {
          await doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'CA', 'BC')
        })
      })
    })
  })

  describe('deactivateDoctor()', () => {
    beforeEach(async () => {
      await doctorManager.addOrReactivateDoctor(doctor3, 'Howser', 'CA', 'BC')
      assert.equal(await doctorManager.isActive(doctor3), true)
      assert.equal(await doctorManager.isDoctor(doctor3), true)
      assert.equal(await doctorManager.doctorCount.call(), 2)
    })

    it('should work', async () => {
      await doctorManager.deactivateDoctor(doctor3)
      assert.equal(await doctorManager.isActive(doctor3), false)
      assert.equal(await doctorManager.isDoctor(doctor3), false)
    })

    it('should not work on non-doctor', async () => {
      await expectThrow(async () => {
        await doctorManager.deactivateDoctor(doctor4)
      })
    })

    it('should reactivate instead of add and update name', async () => {
      await doctorManager.deactivateDoctor(doctor3)
      assert.equal(await doctorManager.isActive(doctor3), false)

      await doctorManager.addOrReactivateDoctor(doctor3, 'Newby', 'CA', 'BC')
      assert.equal(await doctorManager.doctorNames.call(1), 'Newby')
      assert.equal(await doctorManager.name.call(doctor3), 'Newby')
      assert.equal(await doctorManager.doctorCountries.call(1), 'CA')
      assert.equal(await doctorManager.doctorRegions.call(1), 'BC')
    })
  })

})
