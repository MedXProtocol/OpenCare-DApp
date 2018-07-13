import Cookie from 'js-cookie'
import { setCookie } from '~/services/setCookie'
import { getAccountCookie } from '~/accounts/getAccountCookie'
import { KEY_STORE } from '~/accounts/constants'

export function setAccountCookie(address, account) {
  let keyStore = Cookie.getJSON(KEY_STORE)
  if (typeof keyStore !== 'object') {
    keyStore = {}
  }
  keyStore[address] = account

  setCookie(KEY_STORE, keyStore)

  // check validity of data in local data store
  const storedJson = getAccountCookie(address)
  if (JSON.stringify(storedJson) !== JSON.stringify(keyStore[address])) {
    console.error('Unable to successfully set the account data in browser store! Possibly max stored size limit hit?')
  }
}
