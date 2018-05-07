import randomBytes from 'randombytes'
import { toHexString } from './to-hex-string'

export function genKey(length = 16) {
  return toHexString(randomBytes(length))
}
