import Web3 from 'web3'
const web3 = new Web3()

export function sha3() {
  if (web3.utils) {
    return web3.utils.sha3.call(null, ...arguments)
  } else {
    return web3.sha3.call(null, ...arguments)
  }
}
