import Cookie from 'js-cookie'

export function setRequestedPathname(pathname) {
  Cookie.set('last-requested-pathname', pathname, { expires: 999999 })
}
