import aes from './aes'
import aesjs from 'aes-js'
import { deriveKey } from '@/utils/derive-key'

let secretKey = ''

export function isSignedIn () {
  return !!secretKey
}

export function signIn (account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var storedMasterPassword = deriveKey(preimage, account.preimageSalt).toString('hex')
  if (account.storedMasterPassword !== storedMasterPassword) {
    return false
  }

  secretKey = aes.decrypt(account.encryptedSecretKey, preimage)
  return true
}

export function signOut () {
  secretKey = ''
}

export function signedInSecretKey() {
  return secretKey
}

export function decrypt(data) {
  var keyBytes = aesjs.utils.hex.toBytes(secretKey)
  return aes.decryptBytes(data, keyBytes)
}

export function encrypt(data) {
  var keyBytes = aesjs.utils.hex.toBytes(secretKey)
  return aes.encryptBytes(data, keyBytes)
}