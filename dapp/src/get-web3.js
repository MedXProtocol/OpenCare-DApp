import Web3 from 'web3'

let web3

export default function() {
  if (!web3 && window.web3) {
    web3 = new Web3(window.web3.currentProvider)
  }
  return web3
}
