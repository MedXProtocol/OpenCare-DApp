import decryptSecretKeyAsync from './decrypt-secret-key'
import aes from '~/services/aes'
import { deriveKeyAsync } from '~/utils/derive-key'
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
export const ACCOUNT_VERSION = 9

export class Account {

  constructor (json) {
    this._json = json
    this.secretKeyWithSaltCache = {}
  }

  encrypt = async (string, salt) => {
    const key = await this.secretKeyWithSaltAsync(salt)
    return aes.encrypt(string, key)
  }

  decryptAsync (string, salt) {
    return this.secretKeyWithSaltAsync(salt).then(key => {
      return aes.decrypt(string, key)
    })
  }

  deriveSharedKey (publicKey) {
    return deriveSharedKey(this.hexSecretKey(), publicKey)
  }

  unlockAsync = async (masterPassword) => {
    this._secretKey = await decryptSecretKeyAsync(this._json, masterPassword)
  }

  isMasterPassword = async (masterPassword) => {
    return await isAccountMasterPassword(this._json, masterPassword)
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

  // Memoized pattern to avoid deriving multiple times
  hexPublicKey () {
    if (!this._hexPublicKey) {
      this._hexPublicKey = this.deriveKeyPair().getPublic(true, 'hex')
    }

    return this._hexPublicKey
  }

  deriveKeyPair () {
    return deriveKeyPair(this.hexSecretKey())
  }

  secretKeyWithSaltAsync (salt) {
    let key = this.secretKeyWithSaltCache[salt]
    if (key) {
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
    console.log(this)
    setAccount(this.networkId(), this.address(), this.toJson())
  }

  networkId() {
    return this._json.networkId
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

  destroy () {
    setAccount(this.networkId(), this.address(), null)
  }
}

Account.create = async function ({ networkId, address, secretKey, masterPassword }) {
  let account = await Account.build({ networkId, address, secretKey, masterPassword })
  account._secretKey = secretKey
  account.store()
  return account
}

Account.build = async function ({ networkId, address, secretKey, masterPassword }) {
  if (isBlank(networkId) || isBlank(address) || isBlank(secretKey) || isBlank(masterPassword)) {
    throw new Error(
      'networkId, address, secretKey and masterPassword need to be provided as args to Account.create'
    );
  }
  const json = await buildAccount(networkId, address, secretKey, masterPassword)
  const account = new Account(json)
  account.setVersion(ACCOUNT_VERSION)
  account._secretKey = secretKey
  return account
}

Account.get = function (networkId, address) {
  const json = getAccount(networkId, address)
  let account = null
  if (json) {
    account = new Account(json)
    account.store() // ensure cookie is retained indefinitely
  }
  return account
}
