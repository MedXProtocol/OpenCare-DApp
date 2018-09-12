import { weiToEther } from './weiToEther'

// Regexp taken from https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript

export function displayWeiToUsd(usdWei) {
  const rounded = weiToEther(usdWei).toString()
  return rounded.replace(/\d(?=(\d{3})+\.)/g, '$&,')
}
