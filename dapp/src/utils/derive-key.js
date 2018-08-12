import pbkdf2 from 'pbkdf2'
import { promisify } from './common-util';

const ITERATIONS = 10000

export function deriveKeyAsync(password, salt) {
  return promisify(cb => pbkdf2.pbkdf2(password, salt, ITERATIONS, 32, 'sha512', cb))
}
