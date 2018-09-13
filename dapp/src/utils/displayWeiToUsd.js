import { displayWeiToEther } from '~/utils/displayWeiToEther'

export function displayWeiToUsd(usdWei) {
  return displayWeiToEther(usdWei, 2)
}
