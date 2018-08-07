export default function (state, { type, doctor, addresses }) {
  if (typeof state === 'undefined') {
    state = {
      noDoctorsAvailable: false,
      excludedAddresses: []
    }
  }

  switch(type) {
    case 'NEXT_AVAILABLE_DOCTOR':
      state = {
        ...state,
        doctor
      }
      break

    case 'EXCLUDED_DOCTORS':
      state = {
        ...state,
        excludedAddresses: addresses
      }
      break

    case 'FORGET_NEXT_DOCTOR':
      state = {
        ...state,
        noDoctorsAvailable: false
      }

      delete state['doctor']

      break

    case 'NO_DOCTORS_AVAILABLE':
      state = {
        ...state,
        noDoctorsAvailable: true
      }
      break

    // no default
  }

  return state
}
