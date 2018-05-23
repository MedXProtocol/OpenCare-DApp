export default function (state, {type, key}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'RUN_SAGA':
      state = {
        ...state,
        [key]: true
      }
      break

    case 'END_SAGA':
      state = {
        ...state,
        [key]: false
      }
      break
  }

  return state
}
