import { deriveKeyAsync } from '~/utils/derive-key'
import { genKey } from '~/services/gen-key'

export async function hashWithSaltAsync(phrase, salt = genKey()) {
  var hash = await deriveKeyAsync(phrase, salt)

  return [ hash, salt ]
}
