import * as routes from '~/config/routes'

export default function({ isSignedIn, hasAccount, pathname }) {
  let redirect = ''

  if (isSignedIn && hasAccount)
    if (pathname === routes.SIGN_UP || pathname === routes.SIGN_IN)
      redirect = routes.PATIENTS_CASES

  if (!isSignedIn && hasAccount) {
    if (pathname === routes.SIGN_UP)
      redirect = ''
    else if (pathname === routes.WELCOME)
      redirect = ''
    else
      redirect = routes.SIGN_IN
  }

  if (!isSignedIn && !hasAccount) {
    if (pathname === routes.SIGN_IN)
      redirect = ''
    else if (pathname === routes.SIGN_UP)
      redirect = ''
    else
      redirect = routes.WELCOME
  }

  // Clear any redirects if the current path is the same as the
  // redirect calculated above
  if (redirect === pathname)
    redirect = ''

  return redirect
}
