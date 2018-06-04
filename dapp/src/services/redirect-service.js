export default function({isSignedIn, hasAccount, pathname}) {
  let redirect = ''

  if (isSignedIn && hasAccount)
    if (pathname === '/sign-up' || pathname === '/sign-in')
      redirect = '/'

  if (!isSignedIn && hasAccount) {
    if (pathname === '/sign-up')
      redirect = ''
    else
      redirect = '/sign-in'
  }

  if (!isSignedIn && !hasAccount) {
    if (pathname === '/sign-in')
      redirect = ''
    else
      redirect = '/sign-up'
  }

  // Clear any redirects if the current path is the same as the
  // redirect calculated above
  if (redirect === pathname)
    redirect = ''

  return redirect
}
