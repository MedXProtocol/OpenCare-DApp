import { deriveKey } from '~/utils/derive-key'
import { genKey } from '~/services/gen-key'

export function hashWithSalt(phrase, salt = genKey()) {
  var hash = deriveKey(phrase, salt)

  return [ hash, salt ]
}
