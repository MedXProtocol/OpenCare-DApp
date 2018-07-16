import Web3 from 'web3'

const web3 = new Web3()

export function toMedX(amount) {
  return web3.utils.fromWei(amount, 'ether')
}
