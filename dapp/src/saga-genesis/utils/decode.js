import Web3 from 'web3'

const web3 = new Web3()

export const decode = {
  address (value) {
    return web3.eth.abi.decodeParameter('address', value)
  },

  uint256 (value) {
    return web3.eth.abi.decodeParameter('uint256', value)
  },

  bytes (value) {
    return web3.eth.abi.decodeParameter('bytes', value)
  },

  log (inputs, hexData, topics) {
    return web3.eth.abi.decodeParameters(inputs, hexData)
  }
}
