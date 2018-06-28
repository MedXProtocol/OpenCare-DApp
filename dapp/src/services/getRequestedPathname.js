import Cookie from 'js-cookie'

export function getRequestedPathname() {
  return Cookie.getJSON('last-requested-pathname')
}
