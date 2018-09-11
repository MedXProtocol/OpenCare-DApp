export default function (state, {type, block, blockNumber}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch (type) {
    case 'UPDATE_BLOCK_NUMBER':
      state = {...state}
      state.blockNumber = blockNumber
      break

    case 'BLOCK_LATEST':
      state = {...state}
      state.latestBlock = block
      break
    // no default
  }

  return state
}
