export default function (state, {type, blockNumber}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'UPDATE_BLOCK_NUMBER':
      state = {...state}
      state.blockNumber = blockNumber
      break
    // no default
  }

  return state
}
