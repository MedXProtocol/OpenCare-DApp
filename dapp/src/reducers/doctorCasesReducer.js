export default function (state, { type, caseAddress }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'ADD_CASE':
      state = {
        ...state,
        [caseAddress]: {
        }
      }
      break

    case 'UPDATE_CASE':
      state = {
        ...state,
        [caseAddress]: {
          ...state[caseAddress],
        }
      }
      break

    // no default
  }

  return state
}
