export default function (state, {type, networkId}) {
  if (typeof state === 'undefined') {
    state = {
      networkId: ''
    }
  }

  switch (type) {
    case 'WEB3_NETWORK_ID':
      state = {
        networkId
      }
      break

    // no default
  }

  return state
}
