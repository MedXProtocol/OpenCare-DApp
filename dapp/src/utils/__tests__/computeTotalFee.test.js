import BN from 'bn.js'
import { computeTotalFee } from '../computeTotalFee'

describe('computeTotalFee', () => {
  test('return a zero bignumber if undefined', () => {
    expect(computeTotalFee(undefined))
      .toEqual(new BN(0))

    expect(computeTotalFee(null))
      .toEqual(new BN(0))
  })

  test('return the accurate amount', () => {
    expect(computeTotalFee(51.759))
      .toEqual(new BN(76.759))
  })
})
