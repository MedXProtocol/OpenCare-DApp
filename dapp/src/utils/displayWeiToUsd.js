import { weiToEther } from './weiToEther'

export function displayWeiToUsd(usdWei) {
  return weiToEther(usdWei).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
