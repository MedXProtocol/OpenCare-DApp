export default function (state, { type, address }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'USER_ONLINE':
      state = {
        ...state,
        [address]: {
          online: true
        }
      }
      break

    case 'USER_OFFLINE':
      state = {...state}
      delete state[address]
      break

    // no default
  }

  return state
}
