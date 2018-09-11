export const currentTime = function (state, { type }) {
  if (typeof state === 'undefined') {
    state = {
      currentTime: -1
    }
  }

  switch(type) {
    case 'UPDATE_TIME':
      state = {...state}
      state.currentTime = Date.now()

      break
    // no default
  }

  return state
}
