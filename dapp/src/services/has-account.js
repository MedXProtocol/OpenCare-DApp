import Cookie from 'js-cookie'
import { KEY_STORE } from './constants'

export default () => {
  return !!Cookie.get(KEY_STORE)
}
