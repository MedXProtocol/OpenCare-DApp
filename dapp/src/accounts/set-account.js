import Cookie from 'js-cookie'
import { KEY_STORE } from '~/accounts/constants'

export function setAccount(address, account) {
  let keyStore = Cookie.getJSON(KEY_STORE)
  if (typeof keyStore !== 'object') {
    keyStore = {}
  }
  keyStore[address] = account
  Cookie.set(KEY_STORE, keyStore, { expires: 999999 })
}


// 0xD2cE00836F3f3017B356a72344DBC1254bcC1844
// d423-61dd-0efa-0e4a-1eaa-af93-a570-7036-0975-4e35-a9d5-b400-27ff-9919-3586-15a4



// 0x62c404c71db462424a09b789ac318ff03830e8fd
// 6D20-7668-F376-4EDC-3B18-49A2-DF38-3C28-2026-735E-97A3-8451-6165-EAB2-69C9-EB07
