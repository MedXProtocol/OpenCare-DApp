import { CacheScope } from '../cache-scope'
import { createCall } from '../utils/create-call'

describe('CacheScope', () => {
  let cacheScope
  let call1, call2, call3

  beforeEach(() => {
    cacheScope = new CacheScope()
    call1 = createCall('asdf', 'asdf')
    call2 = createCall('qwer', 'qwer')
    call3 = createCall('zxcv', 'zxcv')
  })

  describe('register()', () => {
    it('should increment the call on register', () => {
      expect(cacheScope.count(call1)).toEqual(0)

      cacheScope.register(call1, 1)
      expect(cacheScope.count(call1)).toEqual(1)

      cacheScope.register(call1, 2)
      expect(cacheScope.count(call1)).toEqual(2)

      cacheScope.register(call2, 1)
      expect(cacheScope.count(call2)).toEqual(1)
      expect(cacheScope.count(call1)).toEqual(2)
    })
  })

  describe('deregister', () => {
    it('should decrement the count', () => {
      cacheScope.register(call1, 1)
      cacheScope.register(call2, 1)
      cacheScope.register(call1, 2)
      cacheScope.register(call2, 2)

      expect(cacheScope.count(call1)).toEqual(2)
      expect(cacheScope.count(call2)).toEqual(2)

      cacheScope.deregister(1)

      expect(cacheScope.count(call1)).toEqual(1)
      expect(cacheScope.count(call2)).toEqual(1)

      cacheScope.deregister(1)

      expect(cacheScope.count(call1)).toEqual(1)
      expect(cacheScope.count(call2)).toEqual(1)

      cacheScope.register(call1, 1)
      cacheScope.register(call2, 1)

      expect(cacheScope.count(call1)).toEqual(2)
      expect(cacheScope.count(call2)).toEqual(2)

      cacheScope.deregister(1)

      expect(cacheScope.count(call1)).toEqual(1)
      expect(cacheScope.count(call2)).toEqual(1)
    })
  })
})
