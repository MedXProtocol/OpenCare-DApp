import Cookie from 'js-cookie'
import { setCookie } from '~/services/setCookie'
import { getAccount } from '~/accounts/getAccount'
import { KEY_STORE } from '~/accounts/constants'

export function setAccountCookie(address, account) {
  let keyStore = Cookie.getJSON(KEY_STORE)
  if (typeof keyStore !== 'object') {
    keyStore = {}
  }
  keyStore[address] = account

  setCookie(KEY_STORE, keyStore)

  // check validity of data in local data store
  const storedJson = getAccount(address)
  if (storedJson !== keyStore[address]){
    console.error('Unable to successfully set the account data in browser store! Possibly max stored size limit hit?')
  }
}
