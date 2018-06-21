import decryptSecretKey from './decrypt-secret-key'
import aes from '~/services/aes'
import { deriveKey } from '~/utils/derive-key'
import { deriveKeyPair } from './derive-key-pair'
import { deriveSharedKey } from './derive-shared-key'
import { buildAccount } from './build-account'
import { getAccount } from './get-account'
import { setAccount } from './set-account'
import { isAccountMasterPassword } from './is-account-master-password'
import isBlank from '~/utils/is-blank'

// NOTE: Increment this to destroy old accounts.
// NOTE: DANGEROUS
// NOTE: DO NOT CHANGE THIS
// NOTE: NOTE:
export const ACCOUNT_VERSION = 4

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

  deriveSharedKey (publicKey) {
    return deriveSharedKey(this.hexSecretKey(), publicKey)
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
      key = deriveKey(this.hexSecretKey(), salt)
      this.secretKeyWithSaltCache[salt] = key
    }
    return key
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

  destroy () {
    setAccount(this.address(), null)
  }
}

Account.create = function ({ address, secretKey, masterPassword }) {
  if (isBlank(address) || isBlank(secretKey) || isBlank(masterPassword)) {
    throw new Error(
      'address, secretKey and masterPassword need to be provided as args to Account.create'
    );
  }
  const json = buildAccount(address, secretKey, masterPassword)
  const account = new Account(json)
  account.setVersion(ACCOUNT_VERSION)
  account.unlock(masterPassword)
  account.store()
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
