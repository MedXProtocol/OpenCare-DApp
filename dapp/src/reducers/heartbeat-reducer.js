export default function (state, { type, address, isAvailable }) {
  if (typeof state === 'undefined') {
    state = {
      users: {},
      isAvailable: true
    }
  }

  switch(type) {
    case 'USER_ONLINE':
      state = {
        ...state,
        users: {
          ...state.users,
          [address]: {
            online: true
          }
        }
      }
      break

    case 'USER_OFFLINE':
      state = {...state}
      delete state.users[address]
      break

    case 'AVAILABILITY_CHANGED':
      state = {...state}
      state.isAvailable = !!isAvailable
      break

    // no default
  }

  return state
}
