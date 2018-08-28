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
    let state = nextAvailableDoctor({ doctor: 1 }, { type: 'EXCLUDED_DOCTORS', excludedAddresses: [2, 3]})
    expect(state.excludedAddresses).toEqual([2, 3])
    expect(state.doctor).toEqual(1)
    state = nextAvailableDoctor(state, { type: 'EXCLUDED_DOCTORS', excludedAddresses: [1, 2]})
    expect(state.excludedAddresses).toEqual([1, 2])
    expect(state.doctor).toEqual(undefined)
  })
})
