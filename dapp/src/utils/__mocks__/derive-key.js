import randomBytes from 'randombytes'

const bytes = randomBytes(32)
const key = Buffer.from(bytes).toString('hex')

export function deriveKey() {
  return key
}
