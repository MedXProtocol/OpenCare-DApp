import BigNumber from 'bignumber.js'

export function weiToUsd(wei, usdPerWei) {
  let num

  if (usdPerWei) {
    num = usdPerWei.toString()
  } else {
    num = 0
  }

  return new BigNumber(num).mul(wei.toString())
}
