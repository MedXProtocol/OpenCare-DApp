export default function (state, {type, blockNumber, blockGasLimit}) {
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
      state.blockGasLimit = blockGasLimit
      break
    // no default
  }

  return state
}
