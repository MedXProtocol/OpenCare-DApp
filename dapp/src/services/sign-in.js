import aes from './aes'
import aesjs from 'aes-js'
import Cookie from 'js-cookie'
import { deriveKey } from '@/utils/derive-key'
import { getPublicKey, setPublicKey } from '@/utils/web3-util'
import { deriveKeyPair } from '@/services/derive-key-pair'
import hexToAscii from '@/utils/hex-to-ascii'

let secretKey = ''

export async function isSignedIn () {
  let publicKey = await getPublicKey()
  publicKey = hexToAscii(publicKey)
  return (publicKey && !!signedInSecretKey())
}

export async function signIn (account, masterPassword) {
  var preimage = deriveKey(masterPassword, account.salt)
  var secretKey = aes.decrypt(account.encryptedSecretKey, preimage)

  // setSecretKey(secretKey)
  // NOTE: the code below can be removed and above uncommented after the public keys have been setup in staging

  return getPublicKey().then((publicKey) => {
    if (!hexToAscii(publicKey)) {
      let publicKey = deriveKeyPair(secretKey).getPublic(true, 'hex')
      return setPublicKey(publicKey)
    }
  }).then(() => {
    setSecretKey(secretKey)
  })
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
