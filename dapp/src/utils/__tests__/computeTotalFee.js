import BigNumber from 'bignumber.js'
import { computeTotalFee } from '../computeTotalFee'

describe('computeTotalFee', () => {
  test('return a zero bignumber if undefined', () => {
    expect(computeTotalFee(undefined))
      .toEqual(new BigNumber(0))

    expect(computeTotalFee(null))
      .toEqual(new BigNumber(0))
  })

  test('return the accurate amount', () => {
    expect(computeTotalFee(51.759))
      .toEqual(new BigNumber(76.759))
  })
})
