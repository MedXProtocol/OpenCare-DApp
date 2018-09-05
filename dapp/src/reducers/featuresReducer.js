export default function (state, { type, feature, enabled }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'SET_FEATURE':
      state = {
        ...state,
        [feature]: enabled
      }
      break

    // no default
  }

  return state
}
