import BigNumber from 'bignumber.js'
import { computeChallengeFee } from './computeChallengeFee'

export function computeTotalFee(caseFee) {
  if (!caseFee) return new BigNumber(0)
  return computeChallengeFee(caseFee).plus(caseFee)
}
