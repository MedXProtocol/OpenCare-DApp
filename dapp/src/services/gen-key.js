import randomBytes from 'randombytes'

export function genKey(length = 32) {
  const bytes = randomBytes(length)
  return Buffer.from(bytes).toString('hex')
}
