import pbkdf2 from 'pbkdf2'

export function deriveKey(password, salt) {
  return pbkdf2.pbkdf2Sync(password, salt, 10000, 32, 'sha512')
}
