export default function (state, { type, caseCount }) {
  if (typeof state === 'undefined') {
    state = {
      caseCount: null
    }
  }

  switch (type) {
    case 'UPDATE_CASE_COUNT':
      console.log(caseCount)
      state = {
        ...state,
        caseCount
      }
      break

    // no default
  }

  return state
}
