import BN from 'bn.js'
import { weiToEther } from './weiToEther'

export function displayWeiToEther(wei, decimalPlaces = 4) {
  let etherInWei = new BN('1000000000000000000', 10)
  let divisor = etherInWei.divRound(new BN(10).pow(new BN(decimalPlaces)))
  let rounded = new BN(wei, 10).divRound(divisor).toString(10)
  const fraction = rounded.slice(-decimalPlaces)
  let ethers = rounded.slice(0, -decimalPlaces)
  ethers = ethers.replace(/\d(?=(\d{3})+$)/g, '$&,')
  if (/[^0]/.exec(fraction)) {
     ethers += '.' + fraction
  }
  return ethers
}
