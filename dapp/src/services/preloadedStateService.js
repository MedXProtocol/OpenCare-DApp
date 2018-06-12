import { signedInSecretKey } from '~/services/sign-in'

export const preloadedState = function() {
  let state = {}

  if ((process.env.NODE_ENV === 'development') && signedInSecretKey())
    state = { account: { signedIn: true } }

  return state;
}
