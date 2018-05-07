import { deriveKey } from '@/utils/derive-key'
import hasAccount from './has-account'
import { genKey } from './gen-key'
import { setAccount } from './set-account'
import { buildAccount } from './build-account'
import aes from './aes'
import { ec as EC } from 'elliptic'

export function setupAccount(secretKey, masterPassword) {
  var account = buildAccount(secretKey, masterPassword)
  setAccount(account)
  return account
}
