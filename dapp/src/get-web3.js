import Web3 from 'web3'

export default function() {
  let provider = null
  if (window.web3) {
    provider = window.web3.currentProvider
  }
  const web3 = new Web3(provider)
  return web3
}
