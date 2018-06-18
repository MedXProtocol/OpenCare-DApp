import Cookie from 'js-cookie'
import { Account } from '~/accounts/Account'

let account = null

export function currentAccount() {
  if (process.env.NODE_ENV === 'development') {
    if (!account) {
      const json = JSON.parse(Cookie.get('REFRESH_ACCOUNT'))
      const secretKey = Cookie.get('REFRESH_SECRET_KEY')
      account = new Account(json)
      account._secretKey = secretKey
    }
  }
  return account
}

export function signIn (_account) {
  if (process.env.NODE_ENV === 'development') {
    Cookie.set('REFRESH_ACCOUNT', _account.toJson())
    Cookie.set('REFRESH_SECRET_KEY', _account.secretKey())
  }
  account = _account
}

export function signOut () {
  if (process.env.NODE_ENV === 'development') {
    Cookie.set('REFRESH_ACCOUNT', '')
    Cookie.set('REFRESH_SECRET_KEY', '')
  }
  account = null
}
