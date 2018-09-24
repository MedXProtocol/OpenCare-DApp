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
      excludedAddresses: [],
      searching: false,
      doctor: null
    }
  }

  switch(type) {
    case 'FIND_NEXT_AVAILABLE_DOCTOR':
      state = {
        ...state,
        searching: true
      }
      delete state['doctor']
      if (excludedAddresses) {
        state.excludedAddresses = excludedAddresses
      }

      break

    case 'NEXT_AVAILABLE_DOCTOR':
      state = {
        ...state,
        noDoctorsAvailable: false,
        searching: false,
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
        searching: false,
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
