import BigNumber from 'bignumber.js'

import { weiToEther } from './weiToEther'

export function displayWeiToEther(wei) {
  return new BigNumber(weiToEther(wei)).round(4).toString()
}
