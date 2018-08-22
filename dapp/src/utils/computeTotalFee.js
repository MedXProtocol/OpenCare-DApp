import { computeChallengeFee } from './computeChallengeFee'

export function computeTotalFee(caseFee) {
  if (!caseFee) return 0
  return computeChallengeFee(caseFee).plus(caseFee)
}
