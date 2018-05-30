import Web3 from 'web3'

export default function () {
  let digest = "NotAHex" + Array.from(arguments).join('-')
  const web3 = new Web3(window.web3.currentProvider)
  if (web3.utils) {
    return web3.utils.sha3(digest)
  } else {
    return web3.sha3(digest)
  }
}
