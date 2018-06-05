import update from 'immutability-helper';

export default function (state, {type, overrideError, masterPasswordError, secretKeyError}) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'SIGN_IN':
      state = {
        signingIn: true
      }
    case 'SIGN_IN_ERROR':
      state = {
        ...state,
        signingIn: false,
        overrideError,
        masterPasswordError,
        secretKeyError
      }
      break
    case 'SIGNED_IN':
      state = {
        signedIn: true
      }
      break
    case 'SIGN_OUT':
      state = {
        signedIn: false
      }
      break
  }

  return state
}
