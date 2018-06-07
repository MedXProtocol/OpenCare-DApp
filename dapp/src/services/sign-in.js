import aes from './aes'
import aesjs from 'aes-js'
import Cookie from 'js-cookie'
import { deriveKey } from '~/utils/derive-key'
import decryptSecretKey from '~/services/decrypt-secret-key'
import { deriveKeyPair } from '~/services/derive-key-pair'
import hexToAscii from '~/utils/hex-to-ascii'

let secretKey = ''

export function isSignedIn () {
  return !!signedInSecretKey()
}

export async function signIn (account, masterPassword) {
  var secretKey = decryptSecretKey(account, masterPassword)
  setSecretKey(secretKey)
}

export function signOut () {
  setSecretKey('')
}

function setSecretKey(secret) {
  if (process.env.NODE_ENV === 'development') {
    Cookie.set('SECRET_KEY', secret)
  } else {
    secretKey = secret
  }
}

export function signedInSecretKey() {
  if (process.env.NODE_ENV === 'development') {
    return Cookie.get('SECRET_KEY')
  } else {
    return secretKey
  }
}

export function decrypt(data) {
  var keyBytes = aesjs.utils.hex.toBytes(signedInSecretKey())
  return aes.decryptBytes(data, keyBytes)
}

export function encrypt(data) {
  var keyBytes = aesjs.utils.hex.toBytes(signedInSecretKey())
  return aes.encryptBytes(data, keyBytes)
}
