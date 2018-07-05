import { setCookie } from '~/services/setCookie'

export function setRequestedPathname(pathname) {
  setCookie('last-requested-pathname', pathname)
}
