import {
  checkRegionMatch
} from '../next-available-doctor-saga'

describe('checkRegionMatch()', () => {
  it('should require Canadian patients and Canadian doctors to be in same province', () => {
    expect(checkRegionMatch("CA", "BC", "CA", "AL")).toEqual(false)
    expect(checkRegionMatch("CA", "BC", "CA")).toEqual(false)
    expect(checkRegionMatch("CA", "BC", "CA", "BC")).toEqual(true)
  })

  it('should require American patients and American doctors to be in same state', () => {
    expect(checkRegionMatch("US", "AL", "US", "AK")).toEqual(false)
    expect(checkRegionMatch("US", "AL", "US")).toEqual(false)
    expect(checkRegionMatch("US", "AL", "US", "AL")).toEqual(true)
  })

  it('should allow non-Canadian and non-American patients to use an American doctor', () => {
    expect(checkRegionMatch("US", "AL", "JK")).toEqual(true)
  })

  it('should allow non-Canadian and non-American patients to use a Canadian doctor', () => {
    expect(checkRegionMatch("CA", "BC", "JK")).toEqual(true)
  })

  it('should allow non-American and non-Canadian patients to use a non-Canadian and non-American doctor', () => {
    expect(checkRegionMatch("UK", "SD", "LA", "FD")).toEqual(true)
  })

  it('should allow a Canadian or American patient to use a non-Canadian or non-American doctor', () => {
    expect(checkRegionMatch('UK', 'SD', 'CA', 'BC')).toEqual(true)
    expect(checkRegionMatch('UK', 'SD', 'US', 'AL')).toEqual(true)
  })

  it('should allow a Canadian patient to use an american doctor', () => {
    expect(checkRegionMatch('US', 'AL', 'CA', 'BC')).toEqual(true)
  })

  it('should allow an American patient to use a Canadian doctor', () => {
    expect(checkRegionMatch('CA', 'BC', 'US', 'AL')).toEqual(true)
  })
})
