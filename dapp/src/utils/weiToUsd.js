import BN from 'bn.js'

export function weiToUsd(wei, usdPerWei) {
  let num

  if (usdPerWei) {
    num = usdPerWei.toString()
  } else {
    num = 0
  }

  return new BN(num).mul(new BN(wei))
}
