export default function (state, { type, key, value }){
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'SET_KEY_VALUE':
      state = {
        ...state,
        [key]: value
      }
      break
    case 'UNSET_KEY':
      state = {...state}
      delete state[key]

    // no default
  }

  return state
}
