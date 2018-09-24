import BN from 'bn.js'
import { defined } from '~/utils/defined'

export function toBN(val, { base = 10, defaultValue = '0' } = {}) {
  if (typeof defaultValue !== 'string') {
    throw new Error('The defaultValue must be a string')
  }
  if (!defined(val)) {
    return new BN(defaultValue)
  } else if (!BN.isBN(val)) {
    return new BN('' + val, base)
  } else {
    return val
  }
}
