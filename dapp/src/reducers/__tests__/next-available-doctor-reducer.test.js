import nextAvailableDoctor from '../next-available-doctor-reducer'

describe('nextAvailableDoctor reducer', () => {
  test('init', () => {
    let state = undefined
    let newState = nextAvailableDoctor(state, {})
    expect(newState.noDoctorsAvailable).toEqual(false)
    expect(newState.excludedAddresses).toBeDefined()
  })

  test('FIND_NEXT_AVAILABLE_DOCTOR', () => {
    let state = nextAvailableDoctor(undefined, {})
    let newState = nextAvailableDoctor(undefined, { type: 'FIND_NEXT_AVAILABLE_DOCTOR', excludedAddresses: [2, 3]})
    expect(newState.excludedAddresses).toEqual([2, 3])
  })

  test('NEXT_AVAILABLE_DOCTOR', () => {
    let state = nextAvailableDoctor({}, { type: 'NEXT_AVAILABLE_DOCTOR', doctor: 1 })
    expect(state.doctor).toEqual(1)
  })

  test('EXCLUDED_DOCTORS', () => {
    let state = nextAvailableDoctor({ doctor: { address: 1 } }, { type: 'EXCLUDED_DOCTORS', excludedAddresses: [2, 3]})
    expect(state.excludedAddresses).toEqual([2, 3])
    expect(state.doctor.address).toEqual(1)
    state = nextAvailableDoctor(state, { type: 'EXCLUDED_DOCTORS', excludedAddresses: [1, 2]})
    expect(state.excludedAddresses).toEqual([1, 2])
    expect(state.doctor).toEqual(undefined)
  })

  test('PATIENT_INFO', () => {
    const patientAddress = '0xfa'
    const patientCountry = 'CA'
    const patientRegion = 'BC'
    let newState = nextAvailableDoctor(undefined, {
      type: 'PATIENT_INFO',
      patientAddress,
      patientCountry,
      patientRegion
    })
    expect(newState.patientAddress).toEqual('0xfa')
    expect(newState.patientCountry).toEqual('CA')
    expect(newState.patientRegion).toEqual('BC')
  })
})
