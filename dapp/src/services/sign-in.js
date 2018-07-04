import { setCookie } from '~/services/setCookie'
import Cookie from 'js-cookie'
import { Account } from '~/accounts/Account'

let account = null

function cookiesAreSet() {
  return (
    Cookie.get('REFRESH_ACCOUNT')
    && Cookie.get('REFRESH_SECRET_KEY')
  )
}

export function currentAccount() {
  if (process.env.NODE_ENV === 'development') {
    if (!account && cookiesAreSet()) {
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
    setCookie('REFRESH_ACCOUNT', _account.toJson())
    setCookie('REFRESH_SECRET_KEY', _account.secretKey())
  }
  account = _account
}

export function signOut () {
  if (process.env.NODE_ENV === 'development') {
    setCookie('REFRESH_ACCOUNT', '')
    setCookie('REFRESH_SECRET_KEY', '')
  }
  account = null
}
