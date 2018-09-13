import BN from 'bn.js'
import { weiToEther } from './weiToEther'

export function displayWeiToEther(wei, decimalPlaces = 4) {
  if (!wei) { return '0' }
  const etherInWei = new BN('1000000000000000000', 10)
  const divisor = etherInWei.divRound(new BN(10).pow(new BN(decimalPlaces)))
  const rounded = new BN(wei, 10).divRound(divisor).toString(10)
  const fraction = rounded.slice(-decimalPlaces)
  let ethers = rounded.slice(0, -decimalPlaces)
  ethers = ethers.replace(/\d(?=(\d{3})+$)/g, '$&,')
  if (/[^0]/.exec(fraction)) {
     ethers += '.' + fraction
  }
  return ethers
}
