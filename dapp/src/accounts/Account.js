import decryptSecretKey from './decrypt-secret-key'
import aes from '~/services/aes'
import { hashWithSalt } from '~/services/hashWithSalt'
import { deriveKey, deriveKeyAsync } from '~/utils/derive-key'
import { deriveKeyPair } from './derive-key-pair'
import { deriveSharedKey } from './derive-shared-key'
import { buildAccount } from './build-account'
import { getAccount } from './getAccount'
import { setAccount } from './setAccount'
import { isAccountMasterPassword } from './is-account-master-password'
import { isBlank } from '~/utils/isBlank'

// NOTE: Increment this to destroy old accounts.
// NOTE: DANGEROUS
// NOTE: DO NOT CHANGE THIS
// NOTE: NOTE:
export const ACCOUNT_VERSION = 8

export class Account {
  constructor (json) {
    this._json = json
    this.secretKeyWithSaltCache = {}
  }

  encrypt (string, salt) {
    const key = this.secretKeyWithSalt(salt)
    return aes.encrypt(string, key)
  }

  decrypt (string, salt) {
    const key = this.secretKeyWithSalt(salt)
    return aes.decrypt(string, key)
  }

  decryptAsync (string, salt) {
    return this.secretKeyWithSaltAsync(salt).then(key => {
      return aes.decrypt(string, key)
    })
  }

  deriveSharedKey (publicKey) {
    return deriveSharedKey(this.hexSecretKey(), publicKey)
  }

  deriveKey (salt) {
    return deriveKey(this.hexSecretKey(), salt)
  }

  unlock (masterPassword) {
    this._secretKey = decryptSecretKey(this._json, masterPassword)
  }

  isMasterPassword (masterPassword) {
    return isAccountMasterPassword(this._json, masterPassword)
  }

  unlocked () {
    return !!this._secretKey
  }

  requireUnlocked () {
    if (!this.unlocked()) {
      throw new Error('The account is locked')
    }
  }

  secretKey () {
    this.requireUnlocked()
    return this._secretKey.toLowerCase()
  }

  hexSecretKey () {
    return this.secretKey()
  }

  hexPublicKey () {
    const hexPublicKey = this.deriveKeyPair().getPublic(true, 'hex')
    return hexPublicKey
  }

  deriveKeyPair () {
    return deriveKeyPair(this.hexSecretKey())
  }

  secretKeyWithSalt (salt) {
    let key = this.secretKeyWithSaltCache[salt]
    if (!key) {
      key = this.deriveKey(salt)
      this.secretKeyWithSaltCache[salt] = key
    }
    return key
  }

  secretKeyWithSaltAsync (salt) {
    let key = this.secretKeyWithSaltCache[salt]
    if (key) {
      // console.log(key, 'cached')
      return Promise.resolve(key)
    } else {
      return deriveKeyAsync(this.hexSecretKey(), salt).then(key => {
        this.secretKeyWithSaltCache[salt] = key
        // console.log('the cached version is now: ', this.secretKeyWithSaltCache[salt])
        return key
      })
    }
  }

  store () {
    setAccount(this.address(), this.toJson())
  }

  address() {
    return this._json.address
  }

  toJson() {
    return this._json
  }

  setVersion(version) {
    this._json.version = version
  }

  getVersion() {
    return this._json.version
  }

  hashedSecretKey() {
    return this._json.hashedSecretKey
  }

  setupSecretKeyHash() {
    const secretKey = this.secretKey()
    const [ hashedSecretKey, secretKeySalt ] = hashWithSalt(secretKey)
    this._json = {
      ...this._json,
      hashedSecretKey,
      secretKeySalt
    }
  }

  destroy () {
    setAccount(this.address(), null)
  }
}

Account.create = function ({ address, secretKey, masterPassword }) {
  let account = Account.build({ address, secretKey, masterPassword })
  account.unlock(masterPassword)
  account.store()
  return account
}

Account.build = function ({ address, secretKey, masterPassword }) {
  if (isBlank(address) || isBlank(secretKey) || isBlank(masterPassword)) {
    throw new Error(
      'address, secretKey and masterPassword need to be provided as args to Account.create'
    );
  }
  const json = buildAccount(address, secretKey, masterPassword)
  const account = new Account(json)
  account.setVersion(ACCOUNT_VERSION)
  account._secretKey = secretKey
  return account
}

Account.get = function (address) {
  const json = getAccount(address)
  let account = null
  if (json) {
    account = new Account(json)
    account.store() // ensure cookie is retained indefinitely
  }
  return account
}
