import Cookie from 'js-cookie'

export function setCookie(key, value) {
  Cookie.set(key, value, { expires: 999999 })
}
