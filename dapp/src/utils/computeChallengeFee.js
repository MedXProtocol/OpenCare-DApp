import BN from 'bn.js'

export function computeChallengeFee(caseFee) {
  if (!caseFee) return new BN(0)
  const fee = new BN(caseFee)
  return fee.mul(new BN(50)).div(new BN(100))
}
