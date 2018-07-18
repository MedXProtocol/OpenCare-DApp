import { setCookie } from '~/services/setCookie'
import { signedOutRoutes } from '~/config/routes'

export function setRequestedPathname(pathname) {
  if (!signedOutRoutes.includes(pathname)) {
    setCookie('last-requested-pathname', pathname)
  }
}
