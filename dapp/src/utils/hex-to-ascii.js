import getWeb3 from '@/get-web3'

export default function(value) {
  return getWeb3().toAscii(value)
}
