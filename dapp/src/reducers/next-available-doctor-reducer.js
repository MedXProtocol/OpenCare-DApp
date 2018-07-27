export default function (state, { type, doctor, addresses }) {
  if (typeof state === 'undefined') {
    state = {
      excludedAddresses: [],
      initialized: false
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

    case 'AVAILABLE_DOCTOR_INITIALIZED':
      state = {
        ...state,
        initialized: true
      }
      break

    case 'FORGET_NEXT_DOCTOR':
      delete state['doctor']
      break

    // no default
  }

  return state
}
