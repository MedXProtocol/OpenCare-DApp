import aes from './aes'
import aesjs from 'aes-js'
import Cookie from 'js-cookie'
import { deriveKey } from '@/utils/derive-key'
import { getPublicKey, setPublicKey } from '@/utils/web3-util'
import { deriveKeyPair } from '@/services/derive-key-pair'
import hexToAscii from '@/utils/hex-to-ascii'

let secretKey = ''

export function isSignedIn () {
  return !!signedInSecretKey()
}

export function isValidPublicKey (publicKey) {
  return !!publicKey && !!hexToAscii(publicKey)
}

export async function signInWithPublicKeyCheck (account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var secretKey = aes.decrypt(account.encryptedSecretKey, preimage)

  return getPublicKey().then((publicKey) => {
    if (!publicKey || !hexToAscii(publicKey)) {
      let publicKey = deriveKeyPair(secretKey).getPublic(true, 'hex')
      return setPublicKey(publicKey)
    }
  }).then(() => {
    setSecretKey(secretKey)
  })
}

export async function signIn (account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var secretKey = aes.decrypt(account.encryptedSecretKey, preimage)
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
