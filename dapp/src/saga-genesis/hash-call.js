import getWeb3 from '@/get-web3'

const web3 = getWeb3()

export default function (address, method, args) {
  return web3.utils.sha3(address + method + args.join(','))
}
