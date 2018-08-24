import BigNumber from 'bignumber.js'

export function weiToUsd(wei, usdPerWei) {
  return new BigNumber(usdPerWei || 0).mul(wei)
}
