import Web3 from 'web3'

const web3 = new Web3()

export function medXToWei(amount) {
  return web3.utils.toWei(amount, 'ether')
}
