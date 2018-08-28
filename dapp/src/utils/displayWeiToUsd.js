import { weiToEther } from './weiToEther'
import BigNumber from 'bignumber.js'

// Regexp taken from https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript

export function displayWeiToUsd(usdWei) {
  const ether = new BigNumber(weiToEther(usdWei))
  const rounded = ether.toFixed(2)
  return "$" + rounded.replace(/\d(?=(\d{3})+\.)/g, '$&,')
}
