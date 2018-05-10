import { ec as EC } from 'elliptic'

const curve = new EC('p521')

export function deriveKeyPair(secretKey) {
  return curve.genKeyPair({ entropy: secretKey })
}
