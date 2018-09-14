import BN from 'bn.js'
import { toBN } from '../toBN'

describe('toBN', () => {
  it('should disallow non-string default values', () => {
    expect(() => {
      toBN(null, { defaultValue: 1 })
    }).toThrow()
  })

  it('should handle null', () => {
    expect(toBN(null)).toEqual(new BN('0'))
  })

  it('should handle undefined', () => {
    expect(toBN(undefined)).toEqual(new BN('0'))
  })

  it('should handle undefined', () => {
    expect(toBN(null, { defaultValue: '1' })).toEqual(new BN('1'))
  })

  it('should handle large numbers', () => {
    expect(toBN(3333333333333336)).toEqual(new BN('3333333333333336'))
  })
})
