import getWeb3 from '~/get-web3'

export function weiToEther(amount) {
  const web3 = getWeb3()
  if (!amount) { return 0 }
  return web3.utils.fromWei(amount.toString(), 'ether')
}
