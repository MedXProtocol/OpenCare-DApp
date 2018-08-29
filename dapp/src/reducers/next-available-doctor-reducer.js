export default function (state, {
  type,
  doctor,
  excludedAddresses,
  patientCountry,
  patientRegion
}) {
  if (typeof state === 'undefined') {
    state = {
      noDoctorsAvailable: false,
      excludedAddresses: []
    }
  }

  switch(type) {
    case 'FIND_NEXT_AVAILABLE_DOCTOR':
      state = {...state}
      delete state['doctor']
      if (excludedAddresses) {
        state.excludedAddresses = excludedAddresses
      }

      break

    case 'NEXT_AVAILABLE_DOCTOR':
      state = {
        ...state,
        noDoctorsAvailable: false,
        doctor
      }

      break

    case 'EXCLUDED_DOCTORS':
      state = {
        ...state,
        excludedAddresses
      }

      if (state.doctor && state.excludedAddresses.indexOf(state.doctor.address) !== -1) {
        delete state['doctor']
      }

      break

    case 'NO_DOCTORS_AVAILABLE':
      state = {
        ...state,
        noDoctorsAvailable: true
      }

      delete state['doctor']

      break

    case 'PATIENT_INFO':
      // This works when we delete the doctor from the state prior to setting it
      // to a new object, but not afterwards
      delete state['doctor']
      
      state = {
        ...state,
        patientCountry,
        patientRegion
      }

      break

    // no default
  }

  return state
}
