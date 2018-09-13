import { toBN } from '~/utils/toBN'

export function displayWeiToEther(wei, decimalPlaces = 4) {
  if (!wei) { return '0' }
  const etherInWei = toBN('1000000000000000000', 10)
  const divisor = etherInWei.divRound(toBN(10).pow(toBN(decimalPlaces)))
  const rounded = toBN(wei).divRound(divisor).toString(10)
  const fraction = rounded.slice(-decimalPlaces)
  let ethers = rounded.slice(0, -decimalPlaces)
  ethers = ethers.replace(/\d(?=(\d{3})+$)/g, '$&,')
  if (!ethers) {
    ethers = '0'
  }
  if (/[^0]/.exec(fraction)) {
     ethers += '.' + fraction
  }
  return ethers
}
