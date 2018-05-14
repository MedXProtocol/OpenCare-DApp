import Web3 from 'web3'

export default function() {
  const web3 = new Web3(window.web3.currentProvider)
  return web3
}
