export default function({isSignedIn, hasAccount, pathname, state}) {
  const isAccessScreen = pathname === '/sign-up' || pathname === '/sign-in'
  if (!isSignedIn) {
    if (!isAccessScreen) {
      if (!hasAccount) {
        state.redirect = '/sign-up'
      } else {
        state.redirect = '/sign-in'
      }
      state.requestedPathname = pathname
    } else {
      state.redirect = ''
      if (!state.requestedPathname) {
        state.requestedPathname = '/'
      }
    }
  } else {
    if (state.requestedPathname) {
      state.redirect = state.requestedPathname
      state.requestedPathname = ''
    } else {
      state.redirect = ''
    }
  }
  return state
}
