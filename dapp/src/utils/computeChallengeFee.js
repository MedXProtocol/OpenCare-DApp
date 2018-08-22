import BigNumber from 'bignumber.js'

export function computeChallengeFee(caseFee) {
  if (!caseFee) return 0
  const fee = new BigNumber(caseFee)
  return fee.mul(50).div(100).floor()
}
