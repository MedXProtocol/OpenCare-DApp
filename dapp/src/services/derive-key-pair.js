import { ec } from '@/utils/ec'

export function deriveKeyPair(secretKey) {
  return ec.genKeyPair({ entropy: secretKey })
}
