import { usageRestrictionsToInt, usageRestrictionsToString } from '../usageRestrictions'

describe('usageRestrictionsToInt', () => {
  test('throws on bad values', () => {
    expect(() => {
      usageRestrictionsToInt(1)
    }).toThrow();

    expect(() => {
      usageRestrictionsToInt('Doesnt Exist')
    }).toThrow();
  })

  test('works as expected', () => {
    expect(usageRestrictionsToInt('Locked')).toEqual(0)
    expect(usageRestrictionsToInt('Open To Everyone')).toEqual(1)
    expect(usageRestrictionsToInt('Only Doctors')).toEqual(2)
  })
})

describe('usageRestrictionsToString', () => {
  test('throws on bad values', () => {
    expect(() => {
      usageRestrictionsToString('Locked')
    }).toThrow();

    expect(() => {
      usageRestrictionsToString(3)
    }).toThrow();

    expect(() => {
      usageRestrictionsToString(-1)
    }).toThrow();
  })

  test('works as expected', () => {
    expect(usageRestrictionsToString(0)).toEqual('Locked')
    expect(usageRestrictionsToString(1)).toEqual('Open To Everyone')
    expect(usageRestrictionsToString(2)).toEqual('Only Doctors')
  })
})
