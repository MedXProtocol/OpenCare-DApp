import update from 'immutability-helper';

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {
      loading: false,
      cases: {}
    }
  }

  switch(action.type) {
    case 'DOCTOR_CASES_FETCH_STARTED':
      state = update(state, {
        loading: {
          $set: true
        },
        cases: {
          $set: {}
        }
      })
      break
    case 'DOCTOR_CASES_FETCH_SINGLE_SUCCEEDED':
      state = update(state, {
        cases: {
          [action.index]: {
            $set: action.address
          }
        }
      })
      break
    case 'DOCTOR_CASES_FETCH_SUCCEEDED':
      state = update(state, {
        loading: {
          $set: false
        }
      })
      break
  }

  return state
}
