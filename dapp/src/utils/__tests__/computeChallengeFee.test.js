import BN from 'bn.js'
import { computeChallengeFee } from '../computeChallengeFee'

describe('computeChallengeFee', () => {
  test('return a zero bignumber if undefined', () => {
    expect(computeChallengeFee(undefined))
      .toEqual(new BN(0))

    expect(computeChallengeFee(null))
      .toEqual(new BN(0))
  })

  test('return the accurate amount', () => {
    console.log(computeChallengeFee(50))
    expect(computeChallengeFee(51.759))
      .toEqual(new BN(25))
  })
})
