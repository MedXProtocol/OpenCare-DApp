export default function (state, {
  type,
  message,
  body,
  date,
  error
}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'HEARTBEAT_MESSAGE':
      state = {
        ...state,
        [body.address]: {
          date
        }
      }
      break

    // no default
  }

  return state
}
