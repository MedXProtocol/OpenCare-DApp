import Web3 from 'web3'

export default function() {
  const web3 = new Web3(window.web3.currentProvider)
  web3.eth.defaultAccount = web3.eth.accounts[0]
  return web3
}
