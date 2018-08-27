import Web3 from 'web3'

const web3 = new Web3()

export function etherToWei(amount) {
  if (!amount) { return 0 }
  return web3.utils.toWei(amount.toString(), 'ether')
}
