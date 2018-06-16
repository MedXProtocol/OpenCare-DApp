import { getAccount } from '~/services/sign-in'

export const preloadedState = function() {
  let state = {}

  if ((process.env.NODE_ENV === 'development') && getAccount())
    state = { account: { signedIn: true } }

  return state;
}
