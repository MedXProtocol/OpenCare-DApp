import BN from 'bn.js'
import { computeChallengeFee } from './computeChallengeFee'

export function computeTotalFee(caseFee) {
  if (!caseFee) return new BN(0)
  return computeChallengeFee(caseFee).plus(caseFee)
}
