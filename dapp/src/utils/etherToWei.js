import getWeb3 from '~/get-web3'

export function etherToWei(amount) {
  const web3 = getWeb3()
  if (!amount) { return 0 }
  return web3.utils.toWei(amount.toString(), 'ether')
}
