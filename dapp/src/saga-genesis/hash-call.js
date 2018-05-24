import Web3 from 'web3'

export default function (address, method, ...args) {
  let digest = address + method + args.join('')
  const web3 = new Web3(window.web3)
  if (web3.utils) {
    return web3.utils.sha3(digest)
  } else {
    return web3.sha3(digest)
  }
}
