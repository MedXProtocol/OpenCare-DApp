import { toBN } from '~/utils/toBN'

const ETHER_IN_WEI = toBN('1000000000000000000', 10)

export function displayWeiToEther(wei, decimalPlaces = 4) {
  if (!wei) { return '0' }

  const divisor = ETHER_IN_WEI.divRound(toBN(10).pow(toBN(decimalPlaces)))
  const rounded = toBN(wei).divRound(divisor).toString(10)
  const fraction = rounded.slice(-decimalPlaces)
  let ethers = rounded.slice(0, -decimalPlaces)

  // I've no idea, comment this regex:
  // ;)
  ethers = ethers.replace(/\d(?=(\d{3})+$)/g, '$&,')

  if (!ethers) {
    ethers = '0'
  }

  // Prepend '0.' and the number of leading decimal zeroes
  if (/[^0]/.exec(fraction)) {
    ethers += '.' + '0'.repeat(decimalPlaces - fraction.length) + fraction
  }

  return ethers
}
