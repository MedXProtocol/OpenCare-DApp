import BigNumber from 'bignumber.js'
import { computeChallengeFee } from '../computeChallengeFee'

describe('computeChallengeFee', () => {
  test('return a zero bignumber if undefined', () => {
    expect(computeChallengeFee(undefined))
      .toEqual(new BigNumber(0))

    expect(computeChallengeFee(null))
      .toEqual(new BigNumber(0))
  })

  test('return the accurate amount', () => {
    console.log(computeChallengeFee(50))
    expect(computeChallengeFee(51.759))
      .toEqual(new BigNumber(25))
  })
})
