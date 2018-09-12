import { weiToEther } from './weiToEther'

export function displayWeiToEther(wei) {
  const ether = weiToEther(wei)
  return ether.toString()
}
