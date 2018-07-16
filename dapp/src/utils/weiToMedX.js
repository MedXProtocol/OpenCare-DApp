import Web3 from 'web3'

const web3 = new Web3()

export function weiToMedX(amount) {
  if (!amount) { return 0 }
  return web3.utils.fromWei(amount.toString(), 'ether')
}
